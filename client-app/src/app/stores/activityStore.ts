import { format } from "date-fns";
import { makeAutoObservable, runInAction } from "mobx";
import agent from "../api/agent";
import { Activity, ActivityFormValues } from "../models/activity";
import { Profile } from "../models/profile";
import { store } from "./store";


export default class ActivitStore {
    activityRegistry = new Map<string, Activity>();
    selectedActivity: Activity | undefined = undefined;
    editMode = false;
    loading = false;
    loadingInitial = false;

    constructor() {
        makeAutoObservable(this);
    }

    get activititesByDate() {
        return Array.from(this.activityRegistry.values()).sort((a, b) => a.date!.getTime() - b.date!.getTime());
    }

    get groupedActivities() {
        return Object.entries(
            this.activititesByDate.reduce((activities, activity) => {
                const date = format(activity.date!, 'dd MMMM yyyy');
                activities[date] = activities[date] ? [...activities[date], activity] : [activity];
                return activities;
            }, {} as { [key: string]: Activity[] })
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
        try {
            const activities = await agent.Activities.list();
            activities.forEach(activity => {
                this.setActivity(activity);
            });
        } catch (error) {
            console.log(error);
        } finally {
            this.setLoadingInitial(false);
        }
    }

    loadActivity = async (id: string) => {
        let activity = this.getActivity(id);
        if (activity) {
            this.setSelectedActivity(activity);
            return activity;
        }

        this.setLoadingInitial(true);
        try {
            activity = await agent.Activities.details(id);
            this.setActivity(activity);
            this.setSelectedActivity(activity);
            return activity;
        } catch (error) {
            console.log(error);
        } finally {
            this.setLoadingInitial(false);
        }
    }

    private getActivity = (id: string) => {
        return this.activityRegistry.get(id);
    }

    private setActivity = (activity: Activity) => {
        const user = store.userStore.user;

        if (user) {
            activity.isGoing = activity.attendees!.some(a => a.username === user.username);
            activity.isHost = activity.hostUsername === user.username;
            activity.host = activity.attendees?.find(a => a.username === activity.hostUsername);
        }


        activity.date = new Date(activity.date!);
        this.activityRegistry.set(activity.id, activity);
    }

    createActivity = async (activity: ActivityFormValues) => {
        const user = store.userStore.user;
        const attendee = new Profile(user!);
        try {
            await agent.Activities.create(activity);
            const newActivity = new Activity(activity);
            newActivity.hostUsername = user!.username;
            newActivity.attendees = [attendee];
            this.setActivity(newActivity);
            this.setSelectedActivity(this.selectedActivity);

        } catch (error) {
            console.log(error);
        }
    }

    updateActivity = async (activity: ActivityFormValues) => {

        try {
            await agent.Activities.update(activity);
            runInAction(() => {
                if (activity.id) {
                    let updatedActivity = { ...this.getActivity(activity.id), ...activity } as Activity;
                    this.activityRegistry.set(activity.id, updatedActivity);
                    this.setSelectedActivity(updatedActivity);
                }
            })
        } catch (error) {
            console.log(error);
        }
    }

    deleteActivity = async (id: string) => {
        this.setLoading(true);
        try {
            await agent.Activities.delete(id);
            runInAction(() => {
                this.activityRegistry.delete(id);
            })
        } catch (error) {
            console.log(error);
        } finally {
            this.setLoading(false);
        }
    }

    updateAttendance = async () => {
        const user = store.userStore.user;
        this.setLoading(true);
        try {
            await agent.Activities.attend(this.selectedActivity!.id);
            runInAction(() => {
                if (this.selectedActivity?.isGoing) {
                    this.selectedActivity.attendees = this.selectedActivity!.attendees!.filter(a => a.username !== user!.username);
                    this.selectedActivity.isGoing = false;
                } else {
                    const attendee = new Profile(user!);
                    this.selectedActivity?.attendees?.push(attendee);
                    this.selectedActivity!.isGoing = true;
                }
                this.activityRegistry.set(this.selectedActivity!.id, this.selectedActivity!);
            })

        } catch (error) {
            console.log(error);
        } finally {
            this.setLoading(false);
        }
    }

    cancelActivityToggle = async () => {
        this.setLoading(true);
        try {
            await agent.Activities.attend(this.selectedActivity!.id);
            runInAction(() => {
                this.selectedActivity!.isCancelled = !this.selectedActivity!.isCancelled;
                this.activityRegistry.set(this.selectedActivity!.id, this.selectedActivity!);
            })
        } catch (error) {
            console.log(error);
        } finally {
            this.setLoading(false);
        }
    }

    clearSelectedActivity = () => {
        this.selectedActivity = undefined;
    }
}