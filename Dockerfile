FROM python:3.10
WORKDIR /code
ENV FLASK_APP=main.py
ENV FLASK_RUN_HOST=0.0.0.0
# RUN apk add --no-cache gcc musl-dev linux-headers
COPY requirements.txt requirements.txt
COPY database.sqlite database.sqlite
RUN pip install --upgrade pip
RUN pip install -r requirements.txt
EXPOSE 20080
COPY . .
CMD ["flask", "run"]
# ENV APP /app
# RUN mkdir $APP
# WORKDIR $APP
# EXPOSE 5000
# COPY requirements.txt .
# RUN pip install -r requirements.txt
# COPY . .
# CMD [ "uwsgi", "--ini", "app.ini"]