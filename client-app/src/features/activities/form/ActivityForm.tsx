import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { Link, useHistory, useParams } from "react-router-dom";
import { Button, Header, Segment } from "semantic-ui-react";
import LoadingComponent from "../../../app/layout/LoadingComponent";
import { Activity } from "../../../app/models/activity";
import { useStore } from "../../../app/stores/store";
import { v4 as uuid } from 'uuid';
import { Formik, Form } from "formik";
import * as Yup from "yup";
import MyTextInput from "../../../app/common/form/MyTextInput";
import MyTextArea from "../../../app/common/form/MyTextArea";
import MySelectInput from "../../../app/common/form/MySelectInput";
import { categoryOptions } from "../../../app/common/options/categoryOptions";
import MyDateInput from "../../../app/common/form/MyDateInput";


export default observer(function ActivityForm() {

    const history = useHistory();
    const { activityStore } = useStore();
    const { loading, loadingInitial, createActivity, updateActivity, loadActivity } = activityStore;
    const { id } = useParams<{ id: string }>();

    const [activity, setActivity] = useState<Activity>({
        id: "",
        title: "",
        category: "",
        description: "",
        date: null,
        city: "",
        venue: "",
    });


    const validationSchema = Yup.object({
        title: Yup.string().required("Title is required"),
        description: Yup.string().required("Description is required"),
        category: Yup.string().required(),
        date: Yup.string().required("Date is required").nullable(),
        city: Yup.string().required(),
        venue: Yup.string().required(),
    });

    useEffect(() => {
        if (id)
            loadActivity(id).then(activity => setActivity(activity!));
    }, [loadActivity, id]);

    function handleFormSubmit(activity: Activity) {
        if(activity.id.length === 0){
            let newActivity = {
                ...activity,
                id: uuid()
            };
            createActivity(newActivity).then(() => history.push(`/activities/${newActivity.id}`));
        }else{
            updateActivity(activity).then(() => history.push(`/activities/${activity.id}`));
        }           
    }

    if (loadingInitial) return <LoadingComponent content="Loading activity..." />;

    return (
        <Segment clearing>
            <Header content="Activity Details" sub color="teal"/>
            <Formik 
                validationSchema={validationSchema}
                enableReinitialize 
                initialValues={activity} 
                onSubmit={(values) => handleFormSubmit(values)}>
                {({handleSubmit, isValid, isSubmitting, dirty}) => (
                    <Form className="ui form" onSubmit={handleSubmit} autoComplete='off'>
                        <MyTextInput placeholder="Title" name="title"  />
                        <MyTextArea  placeholder='Description' name='description' rows={3} />
                        <MySelectInput placeholder='Category' name='category' options={categoryOptions} />
                        <MyDateInput 
                            placeholderText="Date"
                            name='date'
                            showTimeSelect
                            timeCaption="time"
                            timeFormat="HH:mm"
                            dateFormat="MMMM d, yyyy HH:mm"
                        />
                        <Header content="Location Details" sub color="teal"/>
                        <MyTextInput placeholder='City' name='city' />
                        <MyTextInput placeholder='Venue' name='venue' />
                        <Button 
                            disabled={!isValid || !dirty || isSubmitting}
                            loading={loading} floated="right" positive type="submit" content="Submit" />
                        <Button as={Link} to="/activities" floated="right" type="button" content="Cancel" />
                    </Form>
                )}
            </Formik>
        </Segment>
    )
})