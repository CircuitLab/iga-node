
set :application, "iga-node"
set :repository,  "git@github.com:CircuitLab/#{application}.git"
set :branch, "master"

set :user, "deployer"
set :use_sudo, false
set :deploy_to, "/home/#{user}/apps/#{application}"

set :scm, :git
set :scm_verbose, true
set :deploy_via, :remote_cache
set :git_shallow_clone, 1

set :node_env, "production"
# set :node_port, 80
set :node_port, 8080
set :process_uid, user
set :process_env, "NODE_ENV=#{node_env} PORT=#{node_port} UID=#{process_uid}"

role :app, 'ec2-54-250-90-29.ap-northeast-1.compute.amazonaws.com'

default_run_options[:pty] = true
ssh_options[:forward_agent] = true

set :default_environment, {
  'PATH' => "~/.nodebrew/current/bin:$PATH"
}

namespace :deploy do
  task :start, :roles => :app do
    run "#{sudo} #{process_env} forever start #{current_path}/app.js"
  end
  task :stop, :roles => :app do
    run "#{sudo} forever stop #{current_path}/app.js"
  end
  task :restart, :roles => :app, :except => { :no_release => true } do
    run "#{sudo} #{process_env} forever restart #{current_path}/app.js"
  end
end

after "deploy:create_symlink", :roles => :app do
  run "ln -svf #{shared_path}/node_modules #{current_path}/node_modules"
  run "cd #{current_path} && npm i"
end