default_run_options[:pty] = true
ssh_options[:forward_agent] = true
set :application, "smartphonebomb"
set :repository, "git@github.com:uniba/DieHard.git"
set :scm, :git
set :branch, "server"
set :scm_verbose, true
set :deploy_via, :remote_cache
set :deploy_to, "/home/deploy/app/#{application}"
set :node_env, 'production'
#set :node_port, 8888
set :user, "deploy"
set :group, "wheel"

role :web, "ec2-23-21-38-54.compute-1.amazonaws.com"                          # Your HTTP server, Apache/etc
role :app, "ec2-23-21-38-54.compute-1.amazonaws.com"                          # This may be the same as your `Web` server
role :db,  "ec2-23-21-38-54.compute-1.amazonaws.com", :primary => true # This is where Rails migrations will run
role :db,  "ec2-23-21-38-54.compute-1.amazonaws.com"

set :use_sudo, false

current_app_path = "#{current_path}/server"
#ここで起動スクリプトをかく。
namespace :deploy do
  task :start, :roles => :app do
      run "cd #{current_app_path } && NODE_ENV=#{node_env} forever start app.js"
  end
  task :stop, :roles => :app do
       run "cd #{current_app_path } && forever stop app.js"
  end
  task :restart, :roles => :app, :except => { :no_release => true } do
    run "cd #{current_app_path } &&  NODE_ENV=#{node_env} forever restart app.js"
  end
  task :npm_install, :roles => :app, :except => { :no_release => true } do
    run "cd #{current_app_path} && npm install"
  end
end

after 'deploy:create_symlink', 'deploy:npm_install'
