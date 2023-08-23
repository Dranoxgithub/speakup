import { AD_CONTENT } from "../util/helperFunctions"

export const YOUR_OWN_VOICE = 'Your Own Voice'

const CustomizedInput = (props) => {
    return (
        <div className="customizedInputContainer">
            <h2>Customize generation</h2>

            <div className="customizedInputBlock">
                <h4>Podcast Title: </h4>
                <input 
                    type="text"
                    value={props.podcastTitle}
                    placeholder="e.g. Twitter Daily Newsletter"
                    onChange={(e) => props.setPodcastTitle(e.target.value)}
                    className="customizedInput"
                />
            </div>

            <div className="customizedInputBlock">
                <h4>Host Name: </h4>
                <input 
                    type="text"
                    placeholder="Zuzu"
                    value={props.hostName}
                    onChange={(e) => props.setHostName(e.target.value)}
                    className="customizedInput"
                />
            </div>

            <div className="customizedInputBlock">
                <h4>Intro Length: </h4>
                <input 
                    type="text"
                    placeholder="e.g. 30 seconds"
                    value={props.introLength}
                    onChange={(e) => props.setIntroLength(e.target.value)}
                    className="customizedInput"
                />
            </div>

            <div className="customizedInputBlock">
                <h4>Paragraph length: </h4>
                <input 
                    type="text"
                    placeholder="e.g. 1 - 2 minutes"
                    value={props.paragraphLength}
                    onChange={(e) => props.setParagraphLength(e.target.value)}
                    className="customizedInput"
                />
            </div>

            <div className="customizedInputBlock">
                <h4>Ad: </h4>
                <input 
                    type="text"
                    placeholder="Your ad to be inserted into the podcast..."
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