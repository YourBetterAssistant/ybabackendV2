FROM arm64v8/node:16.10
RUN apt install git curl wget -y
RUN git clone https://github.com/NotTimIsReal/ybabackendV2
RUN cd ybabackendV2
WORKDIR $HOME/ybabackendV2
RUN ls
RUN yarn install
RUN yarn build
CMD [ "yarn", "start:prod" ]
