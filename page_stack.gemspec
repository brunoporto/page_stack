$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "page_stack/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "page_stack"
  s.version     = PageStack::VERSION
  s.authors     = ["Bruno Porto"]
  s.email       = ["brunotporto@gmail.com"]
  s.homepage    = "https://github.com/brunoporto/page_stack"
  s.summary     = "GEM for navigation using stacked pages"
  s.description = "This GEM make easy the navigation with stacked pages"
  s.license     = "MIT"
  s.files = Dir["{app,config,db,lib}/**/*", "MIT-LICENSE", "Rakefile", "README.md"]
  s.test_files = Dir["test/**/*"]

  s.add_dependency 'remotipart', '~> 0'
  # s.add_dependency 'rails', '~> 4.2.0'

end
