## Demo

Check out the live demo of the web application [here](https://chat-app-postman.vercel.app/).


this chat app works with postmans sended APIs

##HOW TO USE

-at first run json-server(db.json):
cd mock-server
npx json-server --watch db.json --port 5000

login to postman or firebase
-set method to GET and send this url :http://localhost:5000/messages

now you can run the App


# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
