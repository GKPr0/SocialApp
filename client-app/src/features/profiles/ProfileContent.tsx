import React from "react";
import { Tab } from "semantic-ui-react";
import { Profile } from "../../app/models/profile";
import ProfileAbout from "./ProfileAbout";
import ProfilePhotos from "./ProfilePhotos";


export default function ProfileContent() {
    const panes = [
        { menuItem: "About", render: () => <ProfileAbout /> },
        { menuItem: "Photos", render: () => <ProfilePhotos/> },
        { menuItem: "Events", render: () => <Tab.Pane>Events</Tab.Pane> },
        { menuItem: "Followers", render: () => <Tab.Pane>Followers</Tab.Pane> },
        { menuItem: "Following", render: () => <Tab.Pane>Following</Tab.Pane> },
    ]

    return (
        <Tab
            menu={{ fluid: true, vertical: true }}
            menuPosition="right"
            panes={panes}
        />
    )
}