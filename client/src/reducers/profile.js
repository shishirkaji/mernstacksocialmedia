import { GET_PROFILE, PROFILE_ERROR } from "../action/types";

const initalState = {
  profile: null,
  profiles: [],
  repos: [],
  loading: true,
  error: {}
};

export default function (state =initalState , action){
    const {type,payload}= action ;
    
    switch(type){
        case GET_PROFILE :
        return {
            ...state,
            Profile : payload,
            loading : false
        }
        case PROFILE_ERROR:
        return {
            ...state,
            error :payload,
            laoding : false
        };
        default: return state;
    }
}
