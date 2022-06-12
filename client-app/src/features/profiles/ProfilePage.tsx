import { observer } from "mobx-react-lite";
import React from "react";
import { useParams } from "react-router-dom";
import { Grid } from "semantic-ui-react";
import LoadingComponent from "../../app/layout/LoadingComponent";
import { useStore } from "../../app/stores/store";
import ProfileContent from "./ProfileContent";
import ProfilHeader from "./ProfileHeader";


export default observer(function ProfilePage() {
    const {username} = useParams<{username:string}>();
    const {profileStore} = useStore();
    const {profile, loadingProfile, loadProfile} = profileStore;

    React.useEffect(() => {
        loadProfile(username);
    }, [loadProfile, username]);
    
    if(loadingProfile) return <LoadingComponent content="Loading profile..."/>

    return (
        <Grid>
            <Grid.Column width={16}>
                {profile &&
                <> 
                    <ProfilHeader />
                    <ProfileContent/>
                </>
                }
            </Grid.Column>
        </Grid>
    );
})