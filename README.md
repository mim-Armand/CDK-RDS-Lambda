# Welcome to this CDK TypeScript project

This creates and runs a Lambda function that will attempt to connect to the postgress RDS and populate it with sample data for testing purposes!

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template


## info:

You can use this lambda or ( if the db isaccessible and you can connect with a client -as is in our rds example -) you can run the following query:
```sql
INSERT INTO random_data_table (id, name, age)
SELECT 
    generate_series(1, 111) AS id, 
    md5(random()::text) AS name, 
    floor(random() * (80-18+1) + 18)::integer AS age
;
```
