FROM mirav.tencentcloudcr.com/mira/afu/ffmpeg/python

RUN sed -i s@/archive.ubuntu.com/@/mirrors.cloud.tencent.com/@g /etc/apt/sources.list && apt-get clean && apt-get update

RUN apt-get install -y curl

RUN curl -sL https://deb.nodesource.com/setup_16.x | bash -
RUN apt install -y aptitude && aptitude install -y nodejs yarn software-properties-common \
    libcairo2-dev libjpeg-dev libpango1.0-dev libgif-dev build-essential g++ \
    libgl1-mesa-dev xvfb libxi-dev libx11-dev libopencv-dev vim git

RUN mkdir /code
RUN mkdir /code/ffcreator

RUN npm config set proxy=http://43.154.18.182:6398

#下面分三次add，主要是希望build尽可能使用cache，减少rebuild的概率。
ADD ./inkpaint /code/ffcreator/inkpaint
RUN cd /code/ffcreator/inkpaint && npm update -g && npm install --loglevel verbose

ADD ./package.json /code/ffcreator
RUN cd /code/ffcreator && npm update -g && npm install --loglevel verbose
RUN mv /code/ffcreator/node_modules/canvas/build/Release/libcairo.so.2 /code/ || mv /code/ffcreator/node_modules/canvas/build/Release/librsvg-2.so.2 /code/ || echo "libcairo.so.2 or librsvg-2.so.2 not found"
RUN cd /code/ffcreator && npm run do-install

ADD . /code/ffcreator
WORKDIR /code/ffcreator
CMD ["node", "burner.js"]
