import React, {Fragment, useEffect, useState} from 'react';
import axios from 'axios';
import {Container} from 'semantic-ui-react';
import { Activity } from '../models/activity';
import NavBar from './NavBar';
import ActivityDashboard from '../../features/activities/dashboard/ActivityDashboard';
import {v4 as uuid} from 'uuid';

function App() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | undefined>(undefined);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    axios.get<Activity[]>('http://localhost:5000/api/activities')
      .then(res => {
        setActivities(res.data);
      })
      .catch(err => console.log(err));
  }, []);

  function handleSelectActivity(id: string) {
    setSelectedActivity(activities.find(activity => activity.id === id));
  }

  function handleCanceleSelectActivity() {
    setSelectedActivity(undefined);
  }

  function handleFormOpen(id?:string){
    id ? handleSelectActivity(id) : handleCanceleSelectActivity();
    setEditMode(true);
  }

  function handleFormClose() {
    setEditMode(false);
  }

  function handleCreateOrEditActivity(activity: Activity){
    if(activity.id){
      setActivities([...activities.filter(a => a.id !== activity.id), activity]);
    } else {
      setActivities([...activities, {...activity, id: uuid()}]);
    }
    setEditMode(false);
    setSelectedActivity(activity);
  }

  function handleDeleteActivity(id: string) {
    setActivities([...activities.filter(activity => activity.id !== id)]);
  }


  return (
    <Fragment>
      <NavBar openForm={handleFormOpen}/>
      <Container style={{marginTop: '7em'}}>
        <ActivityDashboard 
          activities={activities}
          selectedActivity={selectedActivity}
          selectActivity={handleSelectActivity}
          cancelSelectActivity={handleCanceleSelectActivity}
          editMode={editMode}
          openForm={handleFormOpen}
          closeForm={handleFormClose}
          createOrEdit={handleCreateOrEditActivity}
          deleteActivity={handleDeleteActivity}
        />
      </Container>
    </Fragment>
  );
}


export default App;
