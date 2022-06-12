import { makeAutoObservable, runInAction } from "mobx";
import { Photo, Profile } from "../models/profile";
import agent from "../api/agent";
import { store } from "./store";

export default class ProfileStore {
    profile: Profile | null = null;
    loadingProfile: boolean = false;
    uploadingPhoto: boolean = false;
    deletingPhoto: boolean = false;
    settingMainPhoto: boolean = false;

    constructor() {
        makeAutoObservable(this);
    }

    get isCurrentUser() {
        if (store.userStore.user && this.profile) {
            return store.userStore.user.username === this.profile.username;
        }
        return false;
    }

    setProfile(profile: Profile) {
        this.profile = profile;
    }

    setLoadingProfile(loading: boolean) {
        this.loadingProfile = loading;
    }

    setUploadingPhoto(uploading: boolean) {
        this.uploadingPhoto = uploading;
    }

    setDeletingPhoto(deletingPhoto: boolean) {
        this.deletingPhoto = deletingPhoto;
    }

    setSettingMainPhoto(settingMainPhoto: boolean) {
        this.settingMainPhoto = settingMainPhoto;
    }


    loadProfile = async (username: string) => {
        this.setLoadingProfile(true);
        try {
            const profile = await agent.Profiles.get(username);
            this.setProfile(profile);
        } catch (err) {
            console.error(err);
        }
        this.setLoadingProfile(false);
    }

    editProfile = async (profile: Partial<Profile>) => {
        try {
            await agent.Profiles.edit(profile);
            runInAction(() => {
                if(profile.displayName && profile.displayName !== store.userStore.user?.displayName)
                    store.userStore.setDisplayName(profile.displayName);

                this.profile = {...this.profile, ...profile as Profile};
            });
        }catch (err) {
            console.error(err);
        }
    }

    uploadPhoto = async (file: Blob) => {
        this.setUploadingPhoto(true);
        try {
            const photo = await agent.Profiles.uploadPhoto(file);
            runInAction(() => {
                if (this.profile) {
                    this.profile.photos?.push(photo);
                    if (photo.isMain && store.userStore.user) {
                        store.userStore.setImage(photo.url);
                        this.profile.image = photo.url;
                    }
                }
            });
        } catch (err) {
            console.error(err);
        }
        this.setUploadingPhoto(false);
    }

    setMainPhoto = async (photo: Photo) => {
        this.setSettingMainPhoto(true);
        try {
            await agent.Profiles.setMainPhoto(photo.id);
            store.userStore.setImage(photo.url);
            runInAction(() => {
                if (this.profile && this.profile.photos) {
                    this.profile.photos.find(p => p.isMain)!.isMain = false;
                    this.profile.photos.find(p => p.id === photo.id)!.isMain = true;
                    this.profile.image = photo.url;
                }
            });
        } catch (err) {
            console.error(err);
        }
        this.setSettingMainPhoto(false);
    }

    deletePhoto = async (photo: Photo) => {
        this.setDeletingPhoto(true);
        try {
            await agent.Profiles.deletePhoto(photo.id);
            runInAction(() => {
                if (this.profile && this.profile.photos)
                    this.profile.photos = this.profile.photos.filter(p => p.id !== photo.id)
            });
        } catch (err) {
            console.error(err);
        }
        this.setDeletingPhoto(false);
    }

}
