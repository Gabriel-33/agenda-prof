const express = require('express');

const bodyParser = require('body-parser');

const cors = require('cors');

const mongoose = require('mongoose');

const app = express();
app.use(cors());

app.use(bodyParser.json());

app.use(
    bodyParser.urlencoded({
        extended: true,
    }),
);  

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log('Server started on port 8080');
});
// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/prof_horario', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

// Define the Area schema
const areaSchema = new mongoose.Schema({
  area_nome: {
    type: String,
    required: true
  },
});
const Area = mongoose.model('Area', areaSchema);

app.post('/cadastrar_area', async (req, res) => {
    
    try {
  
      console.log('Request Body:', req.body); // Log the entire request body
  
      // Create a dummy document in the Area collection to trigger its creation
      const area = new Area({
          area_nome:req.body.area_nome
      });
      await area.save();
  
      res.status(201).send('Area collection created successfully');
    } catch (error) {
      console.error('Error creating area collection:', error);
      res.status(500).send('An error occurred while creating the area collection');
    }
});

const profSchema = new mongoose.Schema({
    prof_nome: {
      type: String,
      required: true
    },
    prof_area: {
      type: Number,
      required: true
    },
    prof_horario: {
      type: [{
        horario: Number,
        dia: Number,
        disciplina: String
      }],
      required: false
  },
});

const Prof = mongoose.model('Professor', profSchema);
// Define the route handler to create the area collection

app.post('/cadastrar_professor', async (req, res) => {
    
    try {

      const professor = new Prof({
        prof_nome:req.body.prof_nome,
        prof_area:req.body.prof_area,
      });
      
      await professor.save();
  
      res.status(201).send('Area collection created successfully');
    } catch (error) {
      console.error('Error creating area collection:', error);
      res.status(500).send('An error occurred while creating the area collection');
    }
});

const CursoSchema = new mongoose.Schema({
  curso_nome: {
    type: String,
    required: true
  },
  curso_numero: {
    type: Number,
    required: true
  },
  curso_horario:{
    type: [{
      horario: Number,
      dia: Number,
      disciplina: String,
      professor:String
    }],
  }
});

const Curso = mongoose.model('Curso', CursoSchema);
// Define the route handler to create the area collection

app.post('/cadastrar_curso', async (req, res) => {
  
  try {

    console.log('Request Body:', req.body); // Log the entire request body

    // Create a dummy document in the Area collection to trigger its creation
    const curso = new Curso({
        curso_nome:req.body.curso_nome,
        curso_numero:req.body.curso_numero
    });
    await curso.save();

    res.status(201).send('Area collection created successfully');
  } catch (error) {
    console.error('Error creating area collection:', error);
    res.status(500).send('An error occurred while creating the area collection');
  }
});

const LocalSchema = new mongoose.Schema({
  local_nome: {
    type: String,
    required: true
  },
  local_numero: {
    type: Number,
    required: true
  },
  local_horario:{
    type: [{
      horario: Number,
      dia: Number,
      disciplina: String,
      professor:String,
      curso:String,
      capacidade_local:Number,
    }],
  },
});

const Local = mongoose.model('Local', LocalSchema);
// Define the route handler to create the area collection

app.post('/cadastrar_local', async (req, res) => {
  
  try {

    console.log('Request Body:', req.body); // Log the entire request body

    // Create a dummy document in the Area collection to trigger its creation
    const local = new Local({
        local_nome:req.body.local_nome,
        local_numero:req.body.local_numero,
        local_horario:req.body.local_horario,
    });
    await local.save();

    res.status(201).send('Area collection created successfully');
  } catch (error) {
    console.error('Error creating area collection:', error);
    res.status(500).send('An error occurred while creating the area collection');
  }
});
app.get('/listar_local', async (req, res) => {
  try {
    Local.aggregate([
      { $group: {
      _id: "$local_nome",
      local: {
        $push: {
          numero_local: "$local_numero",
          id_curso:"$_id",
          horario: "$local_horario",
          capacidade:"$capacidade_local",
        }
      },
      count: { $sum: 1 }
      },
    
    },{
      $sort: {
        "semestre.id_curso":1,
      }
    }
    ])
      .then(result => {
        res.json(result);
      })
      .catch(err => {
        console.error('Error performing aggregation:', err);
        res.status(500).json({ error: 'An error occurred during aggregation' });
      });
  } catch (error) {
    console.error('Error fetching area values:', error);
    res.status(500).send('An error occurred while fetching area values');
  }
});
app.put('/editar_local_horario', async (req, res) => {
  /* console.log(req.body.data.horario) */  
  let id = req.body.id_semestre;
  let novo_horario = req.body.novo_horario;
  //console.log(req.body)
  try {
    await Local.findByIdAndUpdate(id, {local_horario: novo_horario });
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.put('/editar_curso_horario', async (req, res) => {
  /* console.log(req.body.data.horario) */  
  let id = req.body.id_semestre;
  let novo_horario = req.body.data.horario;
  console.log(novo_horario);
  try {
    await Curso.findByIdAndUpdate(id, {curso_horario: novo_horario });
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});
app.get('/listar_cursos', async (req, res) => {
  try {
    Curso.aggregate([
      { $group: {
      _id: "$curso_nome",
      semestre: {
        $push: {
          numero_semestre: "$curso_numero",
          id_curso:"$_id",
          horario: "$curso_horario",
        }
      },
      count: { $sum: 1 }
      },
    
    },{
      $sort: {
        "semestre.id_curso":1,
      }
    }
    ])
      .then(result => {
        res.json(result);
      })
      .catch(err => {
        console.error('Error performing aggregation:', err);
        res.status(500).json({ error: 'An error occurred during aggregation' });
      });
  } catch (error) {
    console.error('Error fetching area values:', error);
    res.status(500).send('An error occurred while fetching area values');
  }
});
app.get('/listar_areas', async (req, res) => {
    try {
      // Find all documents in the Area collection
      const areas = await Area.find();
  
      // Log the area values
      console.log('Area Collection:');
      areas.forEach((area) => {
        console.log(area.area_nome);
      });
  
      // Respond with the area values
      res.json(areas);
    } catch (error) {
      console.error('Error fetching area values:', error);
      res.status(500).send('An error occurred while fetching area values');
    }
});

app.get('/listar_professores_nome', async (req, res) => {
  try {
    const professores = await Prof.find({},'prof_nome');

    res.json(professores);
  } catch (error) {
    console.error('Error retrieving professors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/listar_professores', async (req, res) => {
    try {
      Prof.aggregate([
        { $group: {
        _id: "$prof_area",
        professor: {
          $push: {
            id_professor: "$_id",
            professor_nome: "$prof_nome",
            horario_professor:"$prof_horario"
          }
        },
        count: { $sum: 1 }
        },
      
      },{
        $sort: {
          _id: 1
        }
      }
      ])
        .then(result => {
          res.json(result);
        })
        .catch(err => {
          console.error('Error performing aggregation:', err);
          res.status(500).json({ error: 'An error occurred during aggregation' });
        });
    } catch (error) {
      console.error('Error fetching area values:', error);
      res.status(500).send('An error occurred while fetching area values');
    }
});
app.put('/editar_professor_horario', async (req, res) => {
  console.log(req.body)
  let id = req.body.id_professor;
  let novo_horario = req.body.data;
  console.log(id+" "+novo_horario);
  try {
    await Prof.findByIdAndUpdate(id, {prof_horario: novo_horario });
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});
// Start the server

