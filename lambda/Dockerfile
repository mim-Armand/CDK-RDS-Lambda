FROM public.ecr.aws/lambda/nodejs:18
WORKDIR ${LAMBDA_TASK_ROOT}

# Install PostgreSQL client
RUN npm install pg

COPY package.json ${LAMBDA_TASK_ROOT}
RUN npm install --only=production
COPY index.js ${LAMBDA_TASK_ROOT}
COPY script.sql ${LAMBDA_TASK_ROOT}

CMD [ "index.handler" ]


# To build you image:
  #
  #docker build -t <image name> .
  #To run your image locally:
  #
  #docker run -p 9000:8080 <image name>
  #In a separate terminal, you can then locally invoke the function using cURL:
  #
  #curl -XPOST "http://localhost:9000/2015-03-31/functions/function/invocations" -d '{"payload":"hello world!"}'
