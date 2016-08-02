    public class DynamicServiceRoute
        : RouteBase, IRouteHandler
    {
        private string virtualPath = null;
        private ServiceRoute innerServiceRoute = null;
        private Route innerRoute = null;

        public static RouteData GetCurrentRouteData()
        {
            if (HttpContext.Current != null)
            {
                var wrapper = new HttpContextWrapper(HttpContext.Current);
                return wrapper.Request.RequestContext.RouteData;
            }
            return null;
        }

        public DynamicServiceRoute(string pathPrefix, object defaults, ServiceHostFactoryBase serviceHostFactory, Type serviceType)
        {
            if (pathPrefix.IndexOf("{*") >= 0)
            {
                throw new ArgumentException("Path prefix can not include catch-all route parameters.", "pathPrefix");
            }
            if (!pathPrefix.EndsWith("/"))
            {
                pathPrefix += "/";
            }
            pathPrefix += "{*servicePath}";

            virtualPath = serviceType.FullName + "-" + Guid.NewGuid().ToString() + "/";
            innerServiceRoute = new ServiceRoute(virtualPath, serviceHostFactory, serviceType);
            innerRoute = new Route(pathPrefix, new RouteValueDictionary(defaults), this);
        }

        public override RouteData GetRouteData(HttpContextBase httpContext)
        {
            return innerRoute.GetRouteData(httpContext);
        }

        public override VirtualPathData GetVirtualPath(RequestContext requestContext, RouteValueDictionary values)
        {
            return null;
        }

        public System.Web.IHttpHandler GetHttpHandler(RequestContext requestContext)
        {
            requestContext.HttpContext.RewritePath("~/" + virtualPath + requestContext.RouteData.Values["servicePath"], true);
            return innerServiceRoute.RouteHandler.GetHttpHandler(requestContext);
        }
    }