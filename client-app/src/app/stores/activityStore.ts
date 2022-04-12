import { format } from "date-fns";
import { makeAutoObservable, runInAction } from "mobx";
import agent from "../api/agent";
import { Activity } from "../models/activity";


export default class ActivitStore{
    activityRegistry = new Map<string, Activity>();
    selectedActivity: Activity | undefined = undefined;
    editMode = false;
    loading = false;
    loadingInitial = false;

    constructor(){
        makeAutoObservable(this);
    }

    get activititesByDate(){
        return Array.from(this.activityRegistry.values()).sort((a, b) => a.date!.getTime() - b.date!.getTime());
    }
    
    get groupedActivities(){
        return Object.entries(
            this.activititesByDate.reduce((activities, activity) => {
                const date = format(activity.date!, 'dd mmm yyyy');
                activities[date] = activities[date] ? [...activities[date], activity] : [activity];
                return activities;
            }, {} as {[key: string]: Activity[]})
        );
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
                this.setActivity(activity);
              });
        }catch(error){
            console.log(error);
        }finally{
            this.setLoadingInitial(false);
        }
    }

    loadActivity = async (id: string) => {
        let activity = this.getActivity(id);
        if(activity){
            this.setSelectedActivity(activity);
            return activity;
        }
       
        this.setLoadingInitial(true);
        try{
            activity = await agent.Activities.details(id);
            this.setActivity(activity);
            this.setSelectedActivity(activity);
            return activity;
        }catch(error){
            console.log(error);
        }finally{
            this.setLoadingInitial(false);
        }
    }

    private getActivity = (id: string) => {
        return this.activityRegistry.get(id);
    }

    private setActivity = (activity: Activity) => {
        activity.date = new Date(activity.date!);
        this.activityRegistry.set(activity.id, activity);
    }

    createActivity = async (activity: Activity) => {
        this.setLoading(true);
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
            })
        }catch(error){
            console.log(error);
        }finally{
            this.setLoading(false);
        }
    }
}