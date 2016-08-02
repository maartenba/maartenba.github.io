# BlogML import script originally sourced from:
#   https://github.com/philippkueng/philippkueng.github.com/tree/30ef1570f06d33938b18d5eee7767d6641b9a779/source/_import
# Best post I could find about how to use it was here:
#   http://philippkueng.ch/migrate-from-blogengine-dot-net-to-jekyll.html
#
# how to install
# --------------
#   mkdir source/_importer
#   cp blogml.rb to the source/_importer/ you created above
#   cp your BlogML.xml to the same source/_importer/ directory
# 
# make sure to change the "categories" output at the end of this script
# to be the final resting place of your imported posts.  i chose to put mine
# all into the /blog/archives/ folder personally.  by using categories like
# this, it uses the folder structure for all posts to render in that one
# directory.
# 
# if you, on the other hand, want to retain your categories as categories
# in your new blog, feel free to remove the TAGs portion and copy it to the 
# CATEGORIES portion in the final output below.  It will render the categories
# per your BlogML.
#   
# how to run
# --------------
# I prefer this method below so you can run the importer multiple times without
# effecting any new and existing posts you may have created.  because the import
# BLOWS OUT YOUR _posts FOLDER!
#   cd source/_importer/
#   ruby -r './blogml.rb' -e 'Jekyll::BlogML.process()'
#   
# that will execute the script only with that folder
# 
# change Log by eduncan911:
# 
# 2014-04-08
#   added "alias: " to output, changed old_url to be an array with the original old_url as well as a lowercased version
#   added "date: " to output
#   added "tags: " to output to read from categories (since I abused that 10 years ago)
#      you can change this to "categories: " easily and have the same array for them
#   added "published: " to output
#   

module Jekyll

  require 'rexml/document'
  require 'time'
  require "YAML"
  require 'fileutils'

  module BlogML
    #Reads posts from an BlogML dump.
    #It creates a post file for each entry in the dump.
    def self.process(source = "BlogML.xml")
      FileUtils.rmtree "_posts"
      FileUtils.mkdir_p "_posts"
      FileUtils.rmtree "_pages"
      FileUtils.mkdir_p "_pages"
      content = ""
	  blog_root = "http://blog.maartenballiauw.be"
      open(source, "r") { |f| content << f.read }
      
      FileUtils.touch ".htaccess"
	  FileUtils.touch "disqus_map.csv"
	  
      File.open(".htaccess", "w") do |htaccess|	  
		File.open("disqus_map.csv", "w") do |disqus|
      
        htaccess.puts "RewriteEngine on"
        htaccess.puts "RewriteRule ^Syndication.axd$ /feed.xml [R=301,NC]"		
      
        # first, we need to parse the existing categories into a known hash for later lookup
        cats = Hash.new
        catdoc = REXML::Document.new(content)
        catdoc.elements.each("blog/categories/category") do |category|
		  title = category.elements["title"].text
		  title.gsub!(/C\#/, "CSharp")
		  
          cats[category.attributes["id"]] = title
        end
        puts "Categories found: #{cats.values}"
        
        doc = REXML::Document.new(content)
        posts = 0
        doc.elements.each("blog/posts/post") do |item|

          puts
          link = item.attributes["post-url"]

          title = item.elements["title"].text
          puts "        title: #{title}"
          
		  # Author
		  author = "Maarten Balliauw"

          # Use the URL after the last slash as the post's name
          name = link.split("/")[-1]
          puts "original name: #{name}"
          
          # Lowercase name for uniformity
          name.downcase!
          
          # Remove extensions (.html, .aspx, etc)
          name = $1 if name =~ /(.*)\.(.*)/
          puts "  parsed name: #{name}"
        
          # # Remove the leading digits and dash that Serendipity adds
          # name = $1 if name =~ /\d+\-(.*)/
          # puts "name 3: #{name}"
          # puts "name: #{name}"
              
          ## an important note. my blogml.xml had a few spaces and \r\n before
          # the <![CDATA[ markers in the content.  this caused the Ruby REXML parser
          # to ignore all content within element.  i had to remove all of those
          # in order for this line to parse.
          content = item.elements["content"].text   

          ## i'd like to insert a diclaimer that I have imported these posts.
          # note that you'll have to create the file source/_includes/imported_disclaimer.html
          # to render.  i just put a {% blockquote %} with some verbage in it.
          #top: content = "{\%% include imported_disclaimer.html %}\r\n" + content
          content = content + "\r\n{\%% include imported_disclaimer.html %}\r\n"

          ## i'd like to cut off old content from showing in the blog roll. since
          # it requires <!-- more --> to be inserted, we'll just do it at the
          # very top.  someone with more time can make it insert after the first
          # paragraph or something.
          # content = "<!-- more -->\r\n" + content
          
          ## This section is used to cleanup any content data.
          #
          # Replace /image.axd?picture= with /images/
          content.gsub!(/\/image\.axd\?picture\=/, "/images/")
          # Replace /file.axd?file= with /files/
          content.gsub!(/\/file\.axd\?file\=/, "/files/")
          # Replace encoded /'s with real thing
          content.gsub!(/\%2f/, "/")
          content.gsub!(/http:\/\/blog.maartenballiauw.be/, "")  # remove the domain from my links and images
          content.gsub!(/\/blog\/thumbnail\//, "/images/")
          content.gsub!(/{%/, "{")
		  content.gsub!(/<blockquote>/, "\r\n<blockquote>")
		  content.gsub!(/<\/blockquote>/, "\r\n<\/blockquote>\r\n")
        
          ## is this published?
          published = item.attributes["approved"]
          puts "published: #{published}"

          timestamp = Time.parse(item.attributes["date-created"])
          puts "timestamp: #{timestamp}"
		  
		  isPage = false
          if link.include? "/page/"
			  filename = "_pages/#{name}.markdown"		 
			  isPage = true
          else
			  # post_file_name = "#{timestamp.strftime("%Y-%m-%d")}-#{name}"
			  #filename = "_posts/#{timestamp.strftime("%Y-%m-%d")}-#{name}.html"
			  filename = "_posts/#{timestamp.strftime("%Y-%m-%d")}-#{name}.markdown"		 
          end 
          puts "filename: #{filename}"
        
          ## Keep old URL
          # old_url = name
          # htaccess.puts "RewriteRule ^#{name}$ "
          # for GitHub pages, we need to setup an alias
          old_url = [ item.attributes["post-url"] ]
          if item.attributes["post-url"] != item.attributes["post-url"].downcase
            old_url.push(item.attributes["post-url"].downcase)
          end
          puts "old_url: #{old_url}"

          # Add URL rewrite to htaccess (broken now that we use old_url as an array)
          htaccess.puts "RewriteRule ^post/#{old_url}$ /post/#{timestamp.strftime("%Y")}/#{timestamp.strftime("%m")}/#{timestamp.strftime("%d")}/#{name}.html [R=301,NC]"

		  # Map diqus
		  disqus.puts "#{blog_root}#{item.attributes["post-url"]}, #{blog_root}/post/#{timestamp.strftime("%Y")}/#{timestamp.strftime("%m")}/#{timestamp.strftime("%d")}/#{name}.html"
		  disqus.puts "#{blog_root}/post.aspx?id=#{item.attributes["id"]}, #{blog_root}/post/#{timestamp.strftime("%Y")}/#{timestamp.strftime("%m")}/#{timestamp.strftime("%d")}/#{name}.html"
		  
          # since BlogML doesn't support tags, and I haphazardly used categories as tags,
          # we are going to read categories and use them as tags.
          tags = Array.new
          item.elements.each("categories/category") do |category|
            tags.push(cats[category.attributes["ref"]])
          end
          puts "tags: #{tags}"
        
          # puts "#{link} -> #{filename}"
          File.open(filename, "w") do |f|
            # YAML.dump(
            #   {
            #     "layout" => "default",
            #     # "name" => name,
            #     "title" => title,
            #     # "time" => timestamp,
            #   },
			
			if isPage
              f.puts <<-HEADER
---
layout: post
title: "#{title}"
date: #{timestamp.strftime("%Y-%m-%d %H:%M:%S %z")}
comments: false
author: #{author}
sitemap: false
permalink: /#{name}.html
---
HEADER
			else
              f.puts <<-HEADER
---
layout: post
title: "#{title}"
date: #{timestamp.strftime("%Y-%m-%d %H:%M:%S %z")}
comments: true
published: #{published}
categories: ["post"]
tags: #{tags}
alias: #{old_url}
author: #{author}
---
HEADER
			end
			
            # f.puts
            # )
            # f.puts "---\n#{content}"
            f.puts content
          end
          
          posts += 1
        end
        puts "Created #{posts} posts!"
        
      end
      end
	end
  end
end
