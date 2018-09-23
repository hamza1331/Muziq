import { 
    login,
    logout
} from "./actionNames";



export function LoginAction(username){
    return dispatch=>{
        dispatch({
            type:login,
            payload:username
        })
    }
}
export function LogoutAction(){
    return dispatch=>{
        dispatch({
            type:logout
        })
    }
}