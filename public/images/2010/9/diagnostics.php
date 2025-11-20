<?php
/**
 * ======================== CONFIGURATION SETTINGS ==============================
 * If you do not want to use authentication for this page, set USE_AUTHENTICATION to 0.
 * If you use authentication then replace the default password.
 */
define('USE_AUTHENTICATION', 1);
define('USERNAME', 'azure');
define('PASSWORD', 'azure');
date_default_timezone_set('UTC');

/** ===================== END OF CONFIGURATION SETTINGS ========================== */

if ( USE_AUTHENTICATION == 1 ) {
    if (!empty($_SERVER['AUTH_TYPE']) && !empty($_SERVER['REMOTE_USER']) && strcasecmp($_SERVER['REMOTE_USER'], 'anonymous'))
    {
        if (!in_array(strtolower($_SERVER['REMOTE_USER']), array_map('strtolower', $user_allowed))
        && !in_array('all', array_map('strtolower', $user_allowed)))
        {
            echo 'You are not authorised to view this page. Please contact the application administrator.';
            exit;
        }
    }
    else if ( !isset($_SERVER['PHP_AUTH_USER'] ) || !isset( $_SERVER['PHP_AUTH_PW'] ) ||
              $_SERVER['PHP_AUTH_USER'] != USERNAME || $_SERVER['PHP_AUTH_PW'] != PASSWORD ) {
        header( 'WWW-Authenticate: Basic realm="Windows Azure Diagnostics"' );
        header( 'HTTP/1.0 401 Unauthorized' );
        exit;
    }
    else if ( $_SERVER['PHP_AUTH_PW'] == 'azure' )
    {
        echo 'Please change the default password to get this page working.';
        exit;
    }
}

/**
 * Get a "blank" identifier (not instance specific).
 * 
 * @throws Exception
 * @return string
 */
function getBlankRoleIdentifier()
{
	if (!isset($_SERVER['RdRoleId'])) {
		throw new Exception('Server variable \'RdRoleId\' is unknown. Please verify the application is running in Development Fabric or Windows Azure Fabric.');
	}
	
	if (strpos($_SERVER['RdRoleId'], 'deployment(') === false) {
		return substr($_SERVER['RdRoleId'], 0, strrpos($_SERVER['RdRoleId'], '_') + 1);
	} else {
		$roleIdParts = explode('.', $_SERVER['RdRoleId']);
		$fullRoleId = $roleIdParts[0] . '/' . $roleIdParts[2] . '/' . $_SERVER['RdRoleId'];
		return substr($fullRoleId, 0, strrpos($fullRoleId, '.') + 1);
	}
}

/**
 * Get trimmed string
 * 
 * @param string $input
 * @param int $max_len
 * @return string
 */
function getTrimmedString( $input, $max_len ) {
    if ($max_len <= 3) throw new Exception('The maximum allowed length must be bigger than 3');
    
    $result = $input;
    if ( strlen( $result ) > $max_len ) 
        $result = substr( $result, 0, $max_len - 3 ). '...';
        
    return $result;
}

/**
 * Diagnostics model
 */
class DiagnosticsModel {
	/**
	 * Configuration
	 * 
	 * @var Microsoft_WindowsAzure_Diagnostics_ConfigurationInstance
	 */
	public $Configuration = null;
	
	/**
	 * Number of instances
	 * 
	 * @var int
	 */
	public $NumberOfInstances = 0;
	
	/**
	 * Log
	 * 
	 * @var string
	 */
	public $Log = '';
	
	/**
	 * Wrte log
	 * 
	 * @param string $value
	 */
	public function writeLog($value) {
		$this->Log .= date('H:i:s') . ' ' . $value . "\r\n";
	}
}


/** Variable declarations */
$storageClient = null;
$manager = null;
$model = null;

/** Microsoft_WindowsAzure_Storage_Blob */
require_once 'Microsoft/WindowsAzure/Storage/Blob.php';
$storageClient = new Microsoft_WindowsAzure_Storage_Blob();

/** Microsoft_WindowsAzure_Diagnostics_Manager */
require_once 'Microsoft/WindowsAzure/Diagnostics/Manager.php';
$manager = new Microsoft_WindowsAzure_Diagnostics_Manager($storageClient);

/** Load the role configuration for the first role instance if this has not been done. */
if (!isset($_POST['__model']) || (isset($_POST['__action']) && $_POST['__action'] == 'revert')) {
	$model = new DiagnosticsModel();
	$model->Configuration = $manager->getConfigurationForRoleInstance( getBlankRoleIdentifier() . '0' );
	for ($i = 0; $i <= 1000; $i++) {
		if ($manager->configurationForRoleInstanceExists( getBlankRoleIdentifier() . $i )) {
			$model->NumberOfInstances++;
		} else {
			break;
		}
	}
} else {
	$model = unserialize(base64_decode($_POST['__model']));
	$model->Log = '';
}

// Action?
if (isset($_POST['__action']) && ($_POST['__action'] == 'save' || $_POST['__action'] == 'deploy'))
{
	// Save
	$model->writeLog("Saving diagnostics configuration...");
	
	$model->Configuration->DataSources->OverallQuotaInMB = (int)$_POST['OverallQuotaInMB'];

	// Logs
	$model->Configuration->DataSources->Logs->BufferQuotaInMB = (int)$_POST['Logs-BufferQuotaInMB'];
	$model->Configuration->DataSources->Logs->ScheduledTransferPeriodInMinutes = (int)$_POST['Logs-ScheduledTransferPeriodInMinutes'];
	$model->Configuration->DataSources->Logs->ScheduledTransferLogLevelFilter = $_POST['Logs-ScheduledTransferLogLevelFilter'];
	
	// DiagnosticInfrastructureLogs
	$model->Configuration->DataSources->DiagnosticInfrastructureLogs->BufferQuotaInMB = (int)$_POST['DiagnosticInfrastructureLogs-BufferQuotaInMB'];
	$model->Configuration->DataSources->DiagnosticInfrastructureLogs->ScheduledTransferPeriodInMinutes = (int)$_POST['DiagnosticInfrastructureLogs-ScheduledTransferPeriodInMinutes'];
	$model->Configuration->DataSources->DiagnosticInfrastructureLogs->ScheduledTransferLogLevelFilter = $_POST['DiagnosticInfrastructureLogs-ScheduledTransferLogLevelFilter'];
	
	// Performance counters
	$model->Configuration->DataSources->PerformanceCounters->BufferQuotaInMB = (int)$_POST['PerformanceCounters-BufferQuotaInMB'];
	$model->Configuration->DataSources->PerformanceCounters->ScheduledTransferPeriodInMinutes = (int)$_POST['PerformanceCounters-ScheduledTransferPeriodInMinutes'];

	$model->Configuration->DataSources->PerformanceCounters->Subscriptions = array();
	for ($i = 0; $i < 1000; $i++) {
		if (isset($_POST['PerformanceCounters-' . $i . '-CounterSpecifier']) && isset($_POST['PerformanceCounters-' . $i . '-SampleRateInSeconds']) && $_POST['PerformanceCounters-' . $i . '-CounterSpecifier'] != '') {
			$model->Configuration->DataSources->PerformanceCounters->addSubscription(
				$_POST['PerformanceCounters-' . $i . '-CounterSpecifier'],
				(int)$_POST['PerformanceCounters-' . $i . '-SampleRateInSeconds']
			);
		}
	}
		
	if (isset($_POST['PerformanceCounters-CounterSpecifier']) && isset($_POST['PerformanceCounters-SampleRateInSeconds']) && $_POST['PerformanceCounters-CounterSpecifier'] != '') {
		$model->Configuration->DataSources->PerformanceCounters->addSubscription(
			$_POST['PerformanceCounters-CounterSpecifier'],
			(int)$_POST['PerformanceCounters-SampleRateInSeconds']
		);
	}
	
	// Windows event log
	$model->Configuration->DataSources->WindowsEventLog->BufferQuotaInMB = (int)$_POST['WindowsEventLog-BufferQuotaInMB'];
	$model->Configuration->DataSources->WindowsEventLog->ScheduledTransferPeriodInMinutes = (int)$_POST['WindowsEventLog-ScheduledTransferPeriodInMinutes'];
	$model->Configuration->DataSources->WindowsEventLog->ScheduledTransferLogLevelFilter = $_POST['WindowsEventLog-ScheduledTransferLogLevelFilter'];

	$model->Configuration->DataSources->WindowsEventLog->Subscriptions = array();
	for ($i = 0; $i < 1000; $i++) {
		if (isset($_POST['WindowsEventLog-' . $i]) && $_POST['WindowsEventLog-' . $i] != '') {
			$model->Configuration->DataSources->WindowsEventLog->addSubscription(
				$_POST['WindowsEventLog-' . $i]
			);
		}
	}
		
	if (isset($_POST['WindowsEventLog']) && $_POST['WindowsEventLog'] != '') {
		$model->Configuration->DataSources->WindowsEventLog->addSubscription(
			$_POST['WindowsEventLog']
		);
	}
	
	// Directories
	$model->Configuration->DataSources->Directories->BufferQuotaInMB = (int)$_POST['Directories-BufferQuotaInMB'];
	$model->Configuration->DataSources->Directories->ScheduledTransferPeriodInMinutes = (int)$_POST['Directories-ScheduledTransferPeriodInMinutes'];

	$model->Configuration->DataSources->Directories->Subscriptions = array();
	for ($i = 0; $i < 1000; $i++) {
		if (isset($_POST['Directories-' . $i . '-Path']) && isset($_POST['Directories-' . $i . '-Container']) && isset($_POST['Directories-' . $i . '-Quota']) && $_POST['Directories-' . $i . '-Path'] != '') {
			$model->Configuration->DataSources->Directories->addSubscription(
				$_POST['Directories-' . $i . '-Path'],
				$_POST['Directories-' . $i . '-Container'],
				(int)$_POST['Directories-' . $i . '-Quota']
			);
		}
	}
	
	if (isset($_POST['Directories-Path']) && isset($_POST['Directories-Container']) && isset($_POST['Directories-Quota']) && $_POST['Directories-Path'] != '') {
		$model->Configuration->DataSources->Directories->addSubscription(
			$_POST['Directories-Path'],
			$_POST['Directories-Container'],
			(int)$_POST['Directories-Quota']
		);
	}
	
	// Log
	$model->writeLog("Saved diagnostics configuration. Click 'Deploy' to deploy configuration to all instances.");
}
if (isset($_POST['__action']) && $_POST['__action'] == 'deploy') {
	// Deploy
	$model->writeLog("Deploying diagnostics configuration...");
	
	for ($i = 0; $i <= 1000; $i++) {
		$instanceId = getBlankRoleIdentifier() . $i;
		
		if ($manager->configurationForRoleInstanceExists($instanceId)) {
			$model->writeLog("Deploying diagnostics configuration to instance $instanceId...");
			$manager->setConfigurationForRoleInstance($instanceId, $model->Configuration);
			$model->writeLog("Deployed diagnostics configuration to instance $instanceId.");
		} else {
			break;
		}
	}
	$model->writeLog("Deployed diagnostics configuration to all instances.");
}
if (isset($_POST['__action']) && $_POST['__action'] == 'revert') {
	// Revert
	$model->writeLog("Reverted to current configuration.");
}
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
<style type="text/css">
body {
    background-color: #ffffff;
    color: #000000;
    font-family: sans-serif;
    font-size: 0.8em;
}
h1 {
    font-size: 2em;
}
#content {
    width: 960px;
    margin: 5px;
}
#header {
    color: #ffffff;
    border: 1px solid black;
    background-color: #5C87B2;
    margin-bottom: 1em;
    padding: 1em 2em;
}
/*The #menu element credits: */
/*Credits: Dynamic Drive CSS Library */
/*URL: http://www.dynamicdrive.com/style/ */
#menu {
    width: 100%;
    overflow: hidden;
    border-bottom: 1px solid black;
    margin-bottom: 1em; /*bottom horizontal line that runs beneath tabs*/
}
#menu ul {
    margin: 0;
    padding: 0;
    padding-left: 10px; /*offset of tabs relative to browser left edge*/;
    font-weight: bold;
    font-size: 1.2em;
    list-style-type: none;
}
#menu li {
    display: inline;
    margin: 0;
}
#menu li a {
    float: left;
    display: block;
    text-decoration: none;
    margin: 0;
    padding: 7px 8px;
    border-right: 1px solid white; /*padding inside each tab*/
    color: white; /*right divider between tabs*/
    background: #5C87B2; /*background of tabs (default state)*/
}
#menu li a:visited {
    color: white;
}
#menu li a:hover, #menu li.selected a {
    background: #336699;
}
/*The end of the menu elements credits */
.overview{
    float: left;
    width: inherit;
    margin-bottom: 2em;
}
.list{
    float: left;
    width: 100%;
    margin-bottom: 2em;
}
.wideleftpanel{
    float: left;
    width: 520px;
    margin-right: 20px;
}
.widerightpanel{
    float: left;
    width: 420px;
}
.leftpanel{
    float: left;
    width: 310px;
}
.rightpanel{
    float:left;
    width: 320px;
    margin-left: 5px;
}
.extra_margin{
    margin-top: 20px;
}
table {
    border-collapse: collapse;
}
td, th {
    border: 1px solid black;
    vertical-align: baseline;
}
th {
    background-color: #5C87B2;
    font-weight: bold;
    color: #ffffff;
}
.e {
    background-color: #cbe1ef;
    font-weight: bold;
    color: #000000;
    width: 40%;
}
.leftpanel .e{
    width: 50%;
}
.v {
    background-color: #E7E7E7;
    color: #000000;
}
.n{
    background-color: #FFFF00;
    color: #000000;
    font-weight: bold;
}
.notice {
    display: block;
    margin-top: 1.5em;
    padding: 1em;
    background-color: #ffffe0;
    border: 1px solid #dddddd;
}
.clear{
    clear: both;
}
</style>
<title>Windows Azure Diagnostics Manager for PHP</title>
</head>

<body>

<div id="content">
    <div id="header">
        <h1>Windows Azure Diagnostics Manager for PHP</h1>
    </div>
    <div id="menu">
        <ul>
            <li class="selected"><a href="<?php echo $_SERVER['PHP_SELF'];?>">Configuration</a></li>
        </ul>
    </div>
	<form action="<?php echo $_SERVER['PHP_SELF'];?>" method="post">
		<input type="hidden" name="__model" value="<?php echo base64_encode(serialize($model)); ?>" />
		<input type="hidden" name="__action" value="" />
		
		<?php if ($model->Log != '') { ?>
		<pre><?php echo $model->Log; ?></pre>
		<?php } ?>
	    <div class="overview">
	        <div class="wideleftpanel">
	            <table style="width: 100%">
	                <tr>
	                    <th colspan="2">General Information</th>
	                </tr>
	                <tr>
	                    <td class="e">PHP version</td>
	                    <td class="v"><?php echo phpversion(); ?></td>
	                </tr>
	                <tr title="<?php echo $_SERVER['DOCUMENT_ROOT']; ?>">
	                    <td class="e">Document root</td>
	                    <td class="v"><?php echo getTrimmedString( $_SERVER['DOCUMENT_ROOT'], 45 ); ?></td>
	                </tr>
	                <tr title="<?php echo isset( $_SERVER['PHPRC'] ) ? $_SERVER['PHPRC'] : 'Not defined'; ?>">
	                    <td class="e">PHPRC</td>
	                    <td class="v"><?php echo isset( $_SERVER['PHPRC'] ) ? getTrimmedString( $_SERVER['PHPRC'], 45 ) : 'Not defined'; ?></td>
	                </tr>
	                <tr>
	                    <td class="e">Server software</td>
	                    <td class="v"><?php echo isset( $_SERVER['SERVER_SOFTWARE'] ) ? $_SERVER['SERVER_SOFTWARE']: 'Not set'; ?></td>
	                </tr>
	                <tr>
	                    <td class="e">Operating System</td>
	                    <td class="v"><?php echo php_uname( 's' ), ' ', php_uname( 'r' ); ?></td>
	                </tr>
	                  <tr>
	                    <td class="e">Processor information</td>
	                    <td class="v"><?php echo isset( $_SERVER['PROCESSOR_IDENTIFIER'] ) ? $_SERVER['PROCESSOR_IDENTIFIER']: 'Not set'; ?></td>
	                </tr>
	                <tr>
	                    <td class="e">Number of processors</td>
	                    <td class="v"><?php echo isset( $_SERVER['NUMBER_OF_PROCESSORS'] ) ? $_SERVER['NUMBER_OF_PROCESSORS']: 'Not set'; ?></td>
	                </tr>
	                <tr>
	                    <td class="e">Machine name</td>
	                    <td class="v"><?php echo (getenv( 'COMPUTERNAME' ) != FALSE) ? getenv( 'COMPUTERNAME' ) : 'Not set'; ?></td>
	                </tr>
	                <tr>
	                    <td class="e">Host name</td>
	                    <td class="v"><?php echo isset( $_SERVER['HTTP_HOST'] ) ? $_SERVER['HTTP_HOST'] : 'Not set'; ?></td>
	                </tr>
	                <tr>
	                    <td class="e">Number of instances</td>
	                    <td class="v"><?php echo $model->NumberOfInstances; ?></td>
	                </tr>
	                <tr title="<?php echo isset( $_SERVER['RdRoleId'] ) ? $_SERVER['RdRoleId'] : 'Not defined'; ?>">
	                    <td class="e">Role identifier</td>
	                    <td class="v"><?php echo isset( $_SERVER['RdRoleId'] ) ? getTrimmedString( $_SERVER['RdRoleId'], 45 ) : 'Not defined'; ?></td>
	                </tr>
	                <tr>
	                    <td class="e">Application Pool ID</td>
	                    <td class="v"><?php echo (getenv( 'APP_POOL_ID' ) != FALSE) ? getenv( 'APP_POOL_ID') : 'Not available'; ?></td>
	                </tr>
	                <tr>
	                    <td class="e">Site ID</td>
	                    <td class="v"><?php echo isset( $_SERVER['INSTANCE_ID'] ) ? $_SERVER['INSTANCE_ID'] : 'Not available'; ?></td>
	                </tr>
	            </table>
	        </div>
	        
	        <div class="widerightpanel">
	            <table style="width:100%">
	                <tr>
	                    <th colspan="2">General Diagnostics Settings</th>
	                </tr>
	                <tr>
	                    <td class="e">Overall quota in MB</td>
	                    <td class="v"><input type="text" size="6" name="OverallQuotaInMB" value="<?php echo $model->Configuration->DataSources->OverallQuotaInMB; ?>" /> MB</td>
	                </tr>
	            </table>
	        </div>
	        
	        <div class="widerightpanel"><br /></div>
	        
	        <div class="widerightpanel">
	            <table style="width:100%">
	                <tr>
	                    <th colspan="2">Logs Settings</th>
	                </tr>
	                <tr>
	                    <td class="e">Buffer quota in MB</td>
	                    <td class="v"><input type="text" size="6" name="Logs-BufferQuotaInMB" value="<?php echo $model->Configuration->DataSources->Logs->BufferQuotaInMB; ?>" /> MB</td>
	                </tr>
	                <tr>
	                    <td class="e">Scheduled transfer period</td>
	                    <td class="v"><input type="text" size="6" name="Logs-ScheduledTransferPeriodInMinutes" value="<?php echo $model->Configuration->DataSources->Logs->ScheduledTransferPeriodInMinutes; ?>" /> minutes</td>
	                </tr>
	                <tr>
	                    <td class="e">Log level filter</td>
	                    <td class="v">
	                   		<select name="Logs-ScheduledTransferLogLevelFilter" size="1">
	                   			<option><?php echo $model->Configuration->DataSources->Logs->ScheduledTransferLogLevelFilter; ?></option>
	                   			<option>Critical</option>
	                   			<option>Error</option>
	                   			<option>Warning</option>
	                   			<option>Information</option>
	                   			<option>Verbose</option>
	                   			<option>Undefined</option>
	                   		</select>
	                   	</td>
	                </tr>
	            </table>
	        </div>
	        
	        <div class="widerightpanel"><br /></div>
	        
	        <div class="widerightpanel">
	            <table style="width:100%">
	                <tr>
	                    <th colspan="2">Diagnostic Infrastructure Logs Settings</th>
	                </tr>
	                <tr>
	                    <td class="e">Buffer quota in MB</td>
	                    <td class="v"><input type="text" size="6" name="DiagnosticInfrastructureLogs-BufferQuotaInMB" value="<?php echo $model->Configuration->DataSources->DiagnosticInfrastructureLogs->BufferQuotaInMB; ?>" /> MB</td>
	                </tr>
	                <tr>
	                    <td class="e">Scheduled transfer period</td>
	                    <td class="v"><input type="text" size="6" name="DiagnosticInfrastructureLogs-ScheduledTransferPeriodInMinutes" value="<?php echo $model->Configuration->DataSources->DiagnosticInfrastructureLogs->ScheduledTransferPeriodInMinutes; ?>" /> minutes</td>
	                </tr>
	                <tr>
	                    <td class="e">Log level filter</td>
	                    <td class="v">
	                   		<select name="DiagnosticInfrastructureLogs-ScheduledTransferLogLevelFilter" size="1">
	                   			<option><?php echo $model->Configuration->DataSources->DiagnosticInfrastructureLogs->ScheduledTransferLogLevelFilter; ?></option>
	                   			<option>Critical</option>
	                   			<option>Error</option>
	                   			<option>Warning</option>
	                   			<option>Information</option>
	                   			<option>Verbose</option>
	                   			<option>Undefined</option>
	                   		</select>
	                   	</td>
	                </tr>
	            </table>
	        </div>
	    </div>
	    
	    <div class="overview">
	        <div class="wideleftpanel">
	            <table style="width: 100%">
	                <tr>
	                    <th colspan="2">Performance Counter Subscriptions</th>
	                </tr>
	                <tr>
	                    <th>Counter specifier</th>
	                    <th>Sample rate in seconds</th>
	                </tr>
	                <?php
	                $i = -1;
	                foreach ($model->Configuration->DataSources->PerformanceCounters->Subscriptions as $performanceCounter) {
	                	$i++;
	                ?>
	                <tr>
	                    <td class="e"><input type="text" size="26" name="PerformanceCounters-<?php echo $i; ?>-CounterSpecifier" value="<?php echo $performanceCounter->CounterSpecifier; ?>" /></td>
	                    <td class="v"><input type="text" size="6" name="PerformanceCounters-<?php echo $i; ?>-SampleRateInSeconds" value="<?php echo $performanceCounter->SampleRateInSeconds; ?>" /> sec.</td>
	                </tr>
	                <?php } ?>
	                <tr>
	                    <td class="e"><input type="text" size="26" name="PerformanceCounters-CounterSpecifier" value="" /></td>
	                    <td class="v"><input type="text" size="6" name="PerformanceCounters-SampleRateInSeconds" value="1" /> sec.</td>
	                </tr>
	            </table>
	        </div>
	        
	        <div class="widerightpanel">
	            <table style="width:100%">
	                <tr>
	                    <th colspan="2">General Performance Counter Settings</th>
	                </tr>
	                <tr>
	                    <td class="e">Buffer quota in MB</td>
	                    <td class="v"><input type="text" size="6" name="PerformanceCounters-BufferQuotaInMB" value="<?php echo $model->Configuration->DataSources->PerformanceCounters->BufferQuotaInMB; ?>" /> MB</td>
	                </tr>
	                <tr>
	                    <td class="e">Scheduled transfer period</td>
	                    <td class="v"><input type="text" size="6" name="PerformanceCounters-ScheduledTransferPeriodInMinutes" value="<?php echo $model->Configuration->DataSources->PerformanceCounters->ScheduledTransferPeriodInMinutes; ?>" /> minutes</td>
	                </tr>
	            </table>
	        </div>
	    </div>
	    
	    <div class="overview">
	        <div class="wideleftpanel">
	            <table style="width: 100%">
	                <tr>
	                    <th colspan="2">Windows Event Log Subscriptions</th>
	                </tr>
	                <tr>
	                    <th colspan="2">Event log filter</th>
	                </tr>
	                <?php
	                $i = -1;
	                foreach ($model->Configuration->DataSources->WindowsEventLog->Subscriptions as $windowsEventLog) {
	                	$i++;
	                ?>
	                <tr>
	                	<td class="e">Filter:</td>
	                    <td class="v"><input type="text" size="26" name="WindowsEventLog-<?php echo $i; ?>" value="<?php echo $windowsEventLog; ?>" /></td>
	                </tr>
	                <?php } ?>
	                <tr>
	                    <td class="e">Filter:</td>
	                    <td class="v"><input type="text" size="26" name="WindowsEventLog" value="" /></td>
	                </tr>
	            </table>
	        </div>
   
	        <div class="widerightpanel">
	            <table style="width:100%">
	                <tr>
	                    <th colspan="2">General Windows Event Log Settings</th>
	                </tr>
	                <tr>
	                    <td class="e">Buffer quota in MB</td>
	                    <td class="v"><input type="text" size="6" name="WindowsEventLog-BufferQuotaInMB" value="<?php echo $model->Configuration->DataSources->WindowsEventLog->BufferQuotaInMB; ?>" /> MB</td>
	                </tr>
	                <tr>
	                    <td class="e">Scheduled transfer period</td>
	                    <td class="v"><input type="text" size="6" name="WindowsEventLog-ScheduledTransferPeriodInMinutes" value="<?php echo $model->Configuration->DataSources->WindowsEventLog->ScheduledTransferPeriodInMinutes; ?>" /> minutes</td>
	                </tr>
	                <tr>
	                    <td class="e">Log level filter</td>
	                    <td class="v">
	                   		<select name="WindowsEventLog-ScheduledTransferLogLevelFilter" size="1">
	                   			<option><?php echo $model->Configuration->DataSources->WindowsEventLog->ScheduledTransferLogLevelFilter; ?></option>
	                   			<option>Critical</option>
	                   			<option>Error</option>
	                   			<option>Warning</option>
	                   			<option>Information</option>
	                   			<option>Verbose</option>
	                   			<option>Undefined</option>
	                   		</select>
	                   	</td>
	                </tr>
	            </table>
	        </div>
	    </div>
	    
	    <div class="overview">
	        <div class="wideleftpanel">
	            <table style="width: 100%">
	                <tr>
	                    <th colspan="3">Directory Subscriptions</th>
	                </tr>
	                <tr>
	                    <th>Path</th>
	                    <th>Container</th>
	                    <th>Quota in MB</th>
	                </tr>
	                <?php
	                $i = -1;
	                foreach ($model->Configuration->DataSources->Directories->Subscriptions as $directory) {
	                	$i++;
	                ?>
	                <tr>
	                	<td class="e"><input type="text" size="26" name="Directories-<?php echo $i; ?>-Path" value="<?php echo $directory->Path; ?>" /></td>
	                	<td class="v"><input type="text" size="18" name="Directories-<?php echo $i; ?>-Container" value="<?php echo $directory->Container; ?>" /></td>
	                	<td class="v"><input type="text" size="6" name="Directories-<?php echo $i; ?>-Quota" value="<?php echo $directory->DirectoryQuotaInMB; ?>" /> MB</td>
	                </tr>
	                <?php } ?>
	                <tr>
	                	<td class="e"><input type="text" size="26" name="Directories-Path" value="" /></td>
	                	<td class="v"><input type="text" size="18" name="Directories-Container" value="" /></td>
	                	<td class="v"><input type="text" size="6" name="Directories-Quota" value="" /> MB</td>
	                </tr>
	            </table>
	        </div>
   
	        <div class="widerightpanel">
	            <table style="width:100%">
	                <tr>
	                    <th colspan="2">General Directory Settings</th>
	                </tr>
	                <tr>
	                    <td class="e">Buffer quota in MB</td>
	                    <td class="v"><input type="text" size="6" name="Directories-BufferQuotaInMB" value="<?php echo $model->Configuration->DataSources->Directories->BufferQuotaInMB; ?>" /> MB</td>
	                </tr>
	                <tr>
	                    <td class="e">Scheduled transfer period</td>
	                    <td class="v"><input type="text" size="6" name="Directories-ScheduledTransferPeriodInMinutes" value="<?php echo $model->Configuration->DataSources->Directories->ScheduledTransferPeriodInMinutes; ?>" /> minutes</td>
	                </tr>
	            </table>
	        </div>
	    </div>
	    
	    <input type="submit" value="Save" onclick="this.form.__action.value='save';" />
	    <input type="submit" value="Deploy" onclick="this.form.__action.value='deploy';"/>
	    <input type="submit" value="Revert" onclick="this.form.__action.value='revert';"/>
	</form>
	<div class="clear"></div>
	</div>
</body>

</html>