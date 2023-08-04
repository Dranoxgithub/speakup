import DetailedUrlInput from "../components/DetailedUrlInput"
import UserInfoDisplay from "../components/UserInfoDisplay"

const DetailedInputScreen = () => {
    return (
        <div className="container">
            <div className="headerContainer">
                <h1>Customize Your Input</h1>
                <UserInfoDisplay />
            </div>

            <DetailedUrlInput />
        </div>
    )
}

export default DetailedInputScreen