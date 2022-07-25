FROM mirav.tencentcloudcr.com/mira/afu/ffmpeg/node

RUN mkdir /code
RUN mkdir /code/ffcreator

RUN npm config set proxy=http://43.154.18.182:6398

#下面分三次add，主要是希望build尽可能使用cache，减少rebuild的概率。
ADD ./inkpaint /code/ffcreator/inkpaint
RUN cd /code/ffcreator/inkpaint && npm update -g && npm install --loglevel verbose

ADD ./package.json /code/ffcreator
RUN cd /code/ffcreator && npm update -g && npm install --loglevel verbose
RUN mv /code/ffcreator/node_modules/canvas/build/Release/libcairo.so.2 /code/ || mv /code/ffcreator/node_modules/canvas/build/Release/librsvg-2.so.2 /code/ || echo "libcairo.so.2 or librsvg-2.so.2 not found"
RUN cd /code/ffcreator && npm run do-ubuntu-install

ADD . /code/ffcreator
WORKDIR /code/ffcreator
CMD ["xvfb-run", "-a", "-s", "\"-ac -screen 0 1280x1024x24\"", "node", "/code/ffcreator/burner.js"]
