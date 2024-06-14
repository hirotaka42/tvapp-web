FROM node:20
WORKDIR /usr/src/app

# アプリケーションの依存関係をインストールする
COPY xiao.tvapp.web/package*.json ./xiao.tvapp.web/
RUN cd xiao.tvapp.web && npm install --force

# アプリケーションのソースをバンドルする
COPY xiao.tvapp.web ./xiao.tvapp.web

# ポートを開放する
EXPOSE 3000

CMD [ "npm", "--prefix", "xiao.tvapp.web", "run", "dev" ]