const express = require("express");
const { spawn } = require('child_process');
const bodyParser = require("body-parser");
const app = express();
const port = 3001;

app.set("port", port);




app.use(bodyParser.text());

app.get('/', async (req, res) => {
    
    const genreId = req.query.genreId;
    const modeId = req.query.modeId;
    const datatext = req.body;
    
    console.log(`genreId: ${genreId}`);
    console.log(`modeId: ${modeId}`);
    console.log(`datatext: ${datatext}`);
    
    try {
      const result = await getemotion(datatext);
      console.log(`Result: ${result}`);
      res.status(200).send(result);
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  });
  



// app.use(bodyParser.urlencoded({ extended: true }));

  async function getemotion(datatext) {


    return new Promise((resolve, reject) => {

      
      const pythonProcess = spawn('python', ['process.py', datatext]);
      
      let prediction = '';
      pythonProcess.stdout.on('data', (data) => {
        prediction += data.toString();
      });
      pythonProcess.on('close', (code) => {
        console.log(`Python script exited with code ${code}`);
        console.log(`Prediction: ${prediction}`);
        const data = prediction.trim();
        console.log(`Data: ${data}`);
        resolve(data);
      });
      pythonProcess.on('error', (err) => {
        console.error(err);
        reject(err);
      });
    });
  }
  
  
async function get_path(genreId, modeId, prediction) {

  if (modeId=='1'){ //감성100프로
    try {
      const mysql      = require('mysql');
      const connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : '0802',
        database : 'TEST_db'
      });
    
      connection.connect();

      const result = await new Promise((resolve, reject) => {
        connection.query(`SELECT locate FROM test WHERE emotion='${prediction}'`, (error, rows, fields) => {
          if (error) {
            console.error('error connecting: ' + error.stack);
            resolve([]);
          } else {
            resolve(rows);
          }
        });
      });
    
      connection.end();
    
      return result;
    } catch (error) {
      console.error(error);
      return [];
    }


  }
  else if(modeId==='3'){ //중립100프로
    try {
      const mysql      = require('mysql');
      const connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : '0802',
        database : 'TEST_db'
      });
    
      connection.connect();

      const result = await new Promise((resolve, reject) => {
        connection.query(`SELECT locate FROM test WHERE type='2' AND genre='${genreId}' AND emotion='중립'`, (error, rows, fields) => {
          if (error) {
            console.error('error connecting: ' + error.stack);
            resolve([]);
          } else {
            resolve(rows);
          }
        });
      });
    
      connection.end();
    
      return result;
    } catch (error) {
      console.error(error);
      return [];
    }
  }
    else{
      try {
        const mysql      = require('mysql');
        const connection = mysql.createConnection({
          host     : 'localhost',
          user     : 'root',
          password : '0802',
          database : 'TEST_db'
        });
      
        connection.connect();
  
        const result = await new Promise((resolve, reject) => {
          connection.query(`SELECT locate FROM test WHERE emotion='${prediction}' or (emotion='중립' and genre='${genreId}')`, (error, rows, fields) => {
            if (error) {
              console.error('error connecting: ' + error.stack);
              resolve([]);
            } else {
              resolve(rows);
            }
          });
        });
      
        connection.end();
      
        return result;
      } catch (error) {
        console.error(error);
        return [];
      }


    }

  };








function pathToJson(path) {
    return JSON.stringify(path);
  };
  
  app.get('/play', async function (req, res) {
    const { genreId, modeId } = req.query;
    try {
      
      var prediction = await getemotion();
      
      var finalPath = await get_path(genreId, modeId, prediction);
      
      var paths = finalPath.map((row) => row.locate);
      
      res.json(finalPath);
      
    } catch (error) {
      
      console.error(error);
      res.status(500).send('Internal Server Error');
      
    }



  
  });


  app.get('/emotion', async function (req, res) {
    const { genreId, modeId } = req.query;
    try {
    
      var prediction = await getemotion();
      
      console.log(prediction);
      res.json(prediction);
    } catch (error) {
      
      console.error(error);
      res.status(500).send('Internal Server Error');
      
    }



  
  });
  
  

  

app.listen(port, () => console.log("Listening on", port));

module.exports = app;





