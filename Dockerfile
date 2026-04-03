FROM nginx:alpine
COPY ./todo-app/ /usr/share/nginx/html/
COPY ./todo-app/nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
