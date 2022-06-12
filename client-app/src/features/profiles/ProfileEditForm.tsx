import { Formik, Form } from "formik";
import React from "react"; 
import { Button, } from "semantic-ui-react";
import { useStore } from "../../app/stores/store";
import * as Yup from "yup";
import MyTextInput from "../../app/common/form/MyTextInput";
import MyTextArea from "../../app/common/form/MyTextArea";

interface Props{
    setEditMode: (editMode: boolean) => void;
}

export default function ProfileEditForm({ setEditMode }: Props) {
  
    const {profileStore: {profile, editProfile}} = useStore();

    const validationSchema = Yup.object({
        displayName: Yup.string().required("Required"),
    });

    function handleFormSubmit(values: any) {
        editProfile(values).then(() => setEditMode(false))
    }
 
    return (
        <Formik
            initialValues = {{displayName: profile?.displayName, bio: profile?.bio}}
            onSubmit = {handleFormSubmit}
            validationSchema = {validationSchema}
        >
            {({ isValid, isSubmitting, dirty }) => (
                <Form className="ui form">
                    
                    <MyTextInput placeholder="Display Name" name="displayName" />
                    <MyTextArea placeholder='Bio' name='bio' rows={3} />
                    
                    <Button
                        disabled={!isValid || !dirty || isSubmitting}
                        loading={isSubmitting} 
                        floated="right" 
                        positive 
                        type="submit" 
                        content="Update profile" />
                </Form>
            )}
        </Formik>
    )
}