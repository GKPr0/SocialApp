import { makeAutoObservable, runInAction } from "mobx";
import agent from "../api/agent";
import { Activity } from "../models/activity";
import {v4 as uuid} from 'uuid';

export default class ActivitStore{
    activityRegistry = new Map<string, Activity>();
    selectedActivity: Activity | undefined = undefined;
    editMode = false;
    loading = false;
    loadingInitial = true;

    constructor(){
        makeAutoObservable(this);
    }

    get activititesByDate(){
        return Array.from(this.activityRegistry.values()).sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
    }
    
    setSelectedActivity = (activity: Activity | undefined) => {   
        this.selectedActivity = activity;
    }

    setEditMode = (editMode: boolean) => {
        this.editMode = editMode;
    }

    setLoadingInitial = (loadingInitial: boolean) => {
        this.loadingInitial = loadingInitial;
    }

    setLoading = (loading: boolean) => {
        this.loading = loading;
    }

    loadActivities = async () => {
        this.setLoadingInitial(true);
        try{
            const activities = await agent.Activities.list();
            activities.forEach(activity => {
                activity.date = activity.date.split('T')[0];
                this.activityRegistry.set(activity.id, activity);
              });
        }catch(error){
            console.log(error);
        }finally{
            this.setLoadingInitial(false);
        }
    }

    createActivity = async (activity: Activity) => {
        this.setLoading(true);
        activity.id = uuid();
        try{
            await agent.Activities.create(activity);
            runInAction(()=>{
                this.activityRegistry.set(activity.id, activity);
                this.setSelectedActivity(activity);
                this.setEditMode(false);
            })
        }catch(error){
            console.log(error);
        }finally{
            this.setLoading(false);
        }
    }

    updateActivity = async (activity: Activity) => {
        this.setLoading(true);
        try{
            await agent.Activities.update(activity);
            runInAction(()=>{
                this.activityRegistry.set(activity.id, activity);
                this.setSelectedActivity(activity);
                this.setEditMode(false);
            })
        }catch(error){
            console.log(error);
        }finally{
            this.setLoading(false);
        }
    }
    
    deleteActivity = async (id: string) => {
        this.setLoading(true);
        try{
            await agent.Activities.delete(id);
            runInAction(()=>{
                this.activityRegistry.delete(id);
                if(this.selectedActivity?.id === id) 
                    this.cancelSelectedActivity();
            })
        }catch(error){
            console.log(error);
        }finally{
            this.setLoading(false);
        }
    }

    selectActivity = (id: string) => {
        this.setSelectedActivity(this.activityRegistry.get(id));
    }

    cancelSelectedActivity = () => {
        this.setSelectedActivity(undefined);
    }

    openForm = (id?: string) => {
        if(id){
            this.selectActivity(id);
        }else{
            this.cancelSelectedActivity();
        }

        this.setEditMode(true);
    }

    closeForm = () => {
        this.setEditMode(false);
    }
}