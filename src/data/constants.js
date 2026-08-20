// SIH 2026 static data

export const SIH_THEMES = [
  "Agriculture, FoodTech & Rural Development",
  "Blockchain & Cybersecurity",
  "Clean & Green Technology",
  "Disaster Management",
  "Education & Skill Development",
  "Finance & Banking",
  "Fitness & Sports",
  "Food Technology",
  "Healthcare & Biomedical Devices",
  "Heritage & Culture",
  "MedTech / BioTech / HealthTech",
  "Miscellaneous",
  "Renewable / Sustainable Energy",
  "Robotics & Drones",
  "Smart Automation",
  "Smart Education",
  "Transportation & Logistics",
];

export const SKILLS = [
  "Python","Machine Learning","Computer Vision","Web Dev","App Dev",
  "Embedded / Firmware","PCB Design","CAD / 3D Modelling","Data Science",
  "Blockchain","UI / UX","IoT","Cloud / DevOps","Robotics","Signal Processing","3D Printing",
];

export const DEPARTMENTS = ["CSE","ECE","EEE","IT","Mechanical","Civil"];

export const YEARS = ["2nd Year", "3rd Year", "4th Year"];

export const WA_LINK = "https://wa.me/916374166705?text=Hi!%20I%27m%20a%20student%20looking%20for%20help%20with%20my%20project.";

export const SEED_TEAMS = [
  {
    id:"seed-1", teamName:"Team Voltbridge",
    college:"Velammal Engineering College, Chennai",
    track:"Hardware", theme:"Robotics & Drones",
    pitch:"Low-cost IoT node that detects water leaks in campus pipelines and alerts on WhatsApp.",
    psId:"SIH26P103", psTitle:"Smart Water Leak Detection",
    hasIdea:true, hasMentor:false, needsFemale:true,
    wantsSkills:["Embedded / Firmware","IoT","PCB Design"],
    seatsOpen:3, totalSeats:6,
    members:[
      {name:"Arun Kumar",dept:"ECE",year:"3rd Year",gender:"m",skills:"Firmware, ESP32"},
      {name:"Priya Nair",dept:"ECE",year:"3rd Year",gender:"f",skills:"PCB Design"},
      {name:"Rahul S",dept:"EEE",year:"3rd Year",gender:"m",skills:"Electronics"},
    ],
    createdAt: Date.now() - 1000*60*60*5,
  },
  {
    id:"seed-2", teamName:"DataSphere",
    college:"PSG College of Technology, Coimbatore",
    track:"Software", theme:"Agriculture, FoodTech & Rural Development",
    pitch:"Predictive crop disease detection using satellite imagery and CNN models.",
    psId:"", psTitle:"",
    hasIdea:false, hasMentor:true, needsFemale:false,
    wantsSkills:["Machine Learning","Python","Data Science"],
    seatsOpen:2, totalSeats:6,
    members:[
      {name:"Deepika R",dept:"CSE",year:"4th Year",gender:"f",skills:"Python, ML"},
      {name:"Siva Prasad",dept:"CSE",year:"4th Year",gender:"m",skills:"Data Science"},
      {name:"Karthik B",dept:"IT",year:"4th Year",gender:"m",skills:"Cloud, DevOps"},
      {name:"Meena S",dept:"CSE",year:"4th Year",gender:"f",skills:"UI/UX"},
    ],
    createdAt: Date.now() - 1000*60*60*12,
  },
  {
    id:"seed-3", teamName:"AeroSense",
    college:"SRM Institute of Science and Technology, Chennai",
    track:"Hardware", theme:"Robotics & Drones",
    pitch:"Autonomous inspection drone for power line fault detection.",
    psId:"SIH26P218", psTitle:"Power Grid Inspection Drone",
    hasIdea:true, hasMentor:false, needsFemale:true,
    wantsSkills:["Robotics","Embedded / Firmware","CAD / 3D Modelling"],
    seatsOpen:4, totalSeats:6,
    members:[
      {name:"Naveen J",dept:"Aerospace",year:"4th Year",gender:"m",skills:"Flight Control"},
      {name:"Rithika P",dept:"ECE",year:"3rd Year",gender:"f",skills:"Sensors"},
    ],
    createdAt: Date.now() - 1000*60*60*2,
  },
  {
    id:"seed-4", teamName:"MedChain",
    college:"Anna University, Chennai",
    track:"Software", theme:"Healthcare & Biomedical Devices",
    pitch:"Blockchain-based patient health records for rural hospitals with offline-first sync.",
    psId:"SIH26P044", psTitle:"Secure Rural Health Records",
    hasIdea:true, hasMentor:true, needsFemale:false,
    wantsSkills:["Blockchain","Web Dev","UI / UX"],
    seatsOpen:1, totalSeats:6,
    members:[
      {name:"Ananya V",dept:"CSE",year:"4th Year",gender:"f",skills:"Blockchain, Solidity"},
      {name:"Vishnu R",dept:"CSE",year:"4th Year",gender:"m",skills:"React, Node"},
      {name:"Pallavi T",dept:"IT",year:"4th Year",gender:"f",skills:"UI/UX, Figma"},
      {name:"Gowtham S",dept:"CSE",year:"3rd Year",gender:"m",skills:"Backend"},
      {name:"Nithya K",dept:"CSE",year:"4th Year",gender:"f",skills:"Blockchain"},
    ],
    createdAt: Date.now() - 1000*60*60*24,
  },
];

export const SEED_SEEKERS = [
  {
    id:"seeker-1", name:"Harini S",
    college:"Velammal Engineering College, Chennai",
    dept:"CSE", year:"3rd Year", gender:"f",
    skills:["Machine Learning","Python","Computer Vision"],
    bio:"I have 2 published papers on image segmentation and built a real-time object detection app for my mini project.",
    listed:true, createdAt: Date.now() - 1000*60*30,
  },
  {
    id:"seeker-2", name:"Dinesh K",
    college:"PSG College of Technology, Coimbatore",
    dept:"ECE", year:"4th Year", gender:"m",
    skills:["Embedded / Firmware","IoT","PCB Design"],
    bio:"Designed 4 custom PCBs including a BLE-based asset tracker. Comfortable with STM32, ESP32, FreeRTOS.",
    listed:true, createdAt: Date.now() - 1000*60*90,
  },
  {
    id:"seeker-3", name:"Sneha R",
    college:"SRM Institute of Science and Technology, Chennai",
    dept:"IT", year:"3rd Year", gender:"f",
    skills:["Web Dev","UI / UX","App Dev"],
    bio:"Full-stack developer. Built 3 production React apps. Design-first approach, obsessed with UX.",
    listed:true, createdAt: Date.now() - 1000*60*60*3,
  },
];



