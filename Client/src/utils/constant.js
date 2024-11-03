export const HOST = import.meta.env.VITE_SERVER_URL;

export const AUTH_ROUTES = "api/auth";
export const SIGNUP_ROUTES = `${AUTH_ROUTES}/signup`;
export const LOGIN_ROUTES = `${AUTH_ROUTES}/login`;
export const LOGOUT_ROUTES = `${AUTH_ROUTES}/logout`;
export const GET_USERINFO = `${AUTH_ROUTES}/user-info`;
export const UPDATE_PROFILE_ROUTE = `${AUTH_ROUTES}/update-profile`;
export const ADD_PROFILE_IMAGE_ROUTE = `${AUTH_ROUTES}/add-profile-image`;
export const REMOVE_PROFILE_IMAGE_ROUTE = `${AUTH_ROUTES}/remove-profile-image`;

export const CONTACTS_ROUTE = `api/contacts`;
export const SEARCH_CONTACT = `${CONTACTS_ROUTE}/search`;
export const GET_DM_CONTACT_ROUTE = `${CONTACTS_ROUTE}/get-contacts-dm`;
export const GET_ALL_CONTACTS_ROUTES = `${CONTACTS_ROUTE}/get-all-contacts`;

export const MESSAGE_ROUTE = `api/messages`;
export const GET_MESSAGES = `${MESSAGE_ROUTE}/get-messages`;
export const UPLOAD_FILES_ROUTE = `${MESSAGE_ROUTE}/upload-files`;

export const CHANNEL_ROUTES = `api/channel`;
export const CREATE_CHANNEL_ROUTES = `${CHANNEL_ROUTES}/create-channel`;
export const GET_USER_CHANNELS = `${CHANNEL_ROUTES}/get-user-channels`;
export const GET_CHANNELS_MESSAGES = `${CHANNEL_ROUTES}/get-channel-messages`;
