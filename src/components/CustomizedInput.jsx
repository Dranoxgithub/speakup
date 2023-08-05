import { AD_CONTENT } from "../util/helperFunctions"

const CustomizedInput = (props) => {
    return (
        <div className="customizedInputContainer">

            <div className="customizedInputBlock">
                <h4>Podcast Title: </h4>
                <input 
                    type="text"
                    value={props.podcastTitle}
                    onChange={(e) => props.setPodcastTitle(e.target.value)}
                    className="customizedInput"
                />
            </div>

            <div className="customizedInputBlock">
                <h4>Host Name: </h4>
                <input 
                    type="text"
                    value={props.hostName}
                    onChange={(e) => props.setHostName(e.target.value)}
                    className="customizedInput"
                />
            </div>

            <div className="customizedInputBlock">
                <h4>Intro Length: </h4>
                <input 
                    type="text"
                    value={props.introLength}
                    onChange={(e) => props.setIntroLength(e.target.value)}
                    className="customizedInput"
                />
            </div>

            <div className="customizedInputBlock">
                <h4>Paragraph length: </h4>
                <input 
                    type="text"
                    value={props.paragraphLength}
                    onChange={(e) => props.setParagraphLength(e.target.value)}
                    className="customizedInput"
                />
            </div>

            <div className="customizedInputBlock">
                <h4>Ad: </h4>
                <input 
                    type="text"
                    value={AD_CONTENT}
                    disabled={true}
                    className="customizedInput"
                    style={{cursor: 'not-allowed'}}
                />
            </div>
        </div>
    )
}

export default CustomizedInput