FROM arm64v8/node:16.10
RUN apt install git curl wget -y
RUN git clone https://github.com/NotTimIsReal/ybabackendV2
RUN cd ybabackendV2
WORKDIR /ybabackendV2
RUN ls
RUN rm yarn.lock
RUN npm config set registry https://registry.npmjs.org/
SHELL ["/bin/bash", "-c"]
CMD [ "yarn install && yarn build && yarn start:prod" ]
