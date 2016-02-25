sudo apt-get -y update
sudo apt-get -y install git
sudo apt-get -y install python-software-properties
sudo apt-get -y install python
sudo apt-get -y install g++
sudo apt-get -y install make
sudo apt-get -y install libpq-dev
sudo add-apt-repository -y ppa:chris-lea/node.js
sudo apt-get -y update
sudo apt-get -y install nodejs
sudo apt-get -y install postgresql
sudo apt-get -y install postgresql-client

sudo -u postgres psql -U postgres -d postgres -c "alter user postgres with password 'password';"
sudo -u postgres createdb ripple_gateway
export DATABASE_URL=postgres://postgres:password@localhost:5432/ripple_gateway

sudo npm install -g pm2
sudo npm install -g pg
sudo npm install -g db-migrate
sudo npm install -g forever
sudo npm install -g grunt
sudo npm install -g grunt-cli
npm install --save ripple-gateway

cd node_modules/ripple-gateway
grunt migrate:up
bin/gateway start
