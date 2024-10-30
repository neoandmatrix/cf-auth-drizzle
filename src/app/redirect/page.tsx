import { redirect } from "next/navigation";

export default function Redirect(){
    return <>
        {redirect('https://github.com')}
    </>
}