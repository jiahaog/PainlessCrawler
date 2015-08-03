FROM node:0.12.2
MAINTAINER Jia Hao

LABEL description="Docker image for the testing of PainlessCrawler"


COPY ./../ PainlessCrawler

WORKDIR PainlessCrawler

RUN npm install

CMD npm test