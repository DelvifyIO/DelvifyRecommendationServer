# DelvifyRecommendationServer

## Prerequisite
1. mySql database(table `delvify`)
```
Check the mysql status:
systemctl status mongod
if not running
[May not require]sudo systemctl restart mysql
```
2. mongoDb
```
Check the mongod status:
service mongod status
if not running
[May not require]sudo systemctl unmask mongod && sudo service mongod start
sudo systemctl enable mongod.service
sudo systemctl restart mongodb
```

## Install and Run
1. `npm install`
2. add .env file
3. `npm run start`
4. `npm install --save-dev nodemon`
4. `npm run`  # might not require
5. `npm run seed`
