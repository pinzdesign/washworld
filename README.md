# WashWorld Boilerplate

A simpelt setup for overordnet projekt, både back- og frontend. Denne setup inkluderer alle dependencies, Flask backend, med en db connector som henter en simpelt tekst besked fra database og viser den på en nextJS side.
Dvs en core som vi kan udvikle på fremover, med alt vi beslutter os for.

- Vi kan oprette nye endpoints i app.py
- Vi kan oprette andre hjælpe funktioner i x.py
- Vi kan oprette nye sider/componenter til frontend
- CORS er sat op også
- Backend og frontend kommunikerer via REST API som det skal
- Next.js frontend virker
- Docker setup virker
- phpMyAdmin tilgængelig
- Jeg har også lagt ind database eksport filen

---

## Basic How-To

1. Clone repo:

git clone https://github.com/pinzdesign/washworld.git

2. Start Dockeren op

3. I terminalen kør:

docker compose up --build

3 containere popper op i Dockeren

4. Åbn phpMyAdmin og importer databasen...der er ikke ret meget, bare en test tabel med test_id og test_message, databasen bliver også oprettet under setup, så bare opret tabellen

NB: Der er ikke noget behov for at køre "npm run dev" for nextJS fordi det hele er containerized allerede

---

## Access URLs

Frontend:
http://localhost:3000

Backend API:
http://localhost:5000

Test endpoint:
http://localhost:5000/test

phpMyAdmin:
http://localhost:8080

---

## Database login (phpMyAdmin)

Server: mariadb  
User: root  
Password: password  
Database: washworld  

---

## Bugs / Issues

...

## TO DO

...
