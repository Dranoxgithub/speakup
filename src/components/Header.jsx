import purple_logo from '../assets/purple_logo.svg'
import UserInfoDisplay from "./UserInfoDisplay";
import { BiTimeFive } from "react-icons/bi";
import { AiOutlineArrowLeft } from "react-icons/ai";

const Header = (props) => {
    return (
        <div style={{width: '100%'}}>
            <div className="headerContainer">
            {props.isDashboard ? 
                <div
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        padding: '10px 0px'
                    }}
                >
                <img src={purple_logo} height={36} style={{marginRight: '10px', fill: '#2b1c50'}} />
                
                    <h1 className="dashboardHeaderText">SpeakUp</h1>
                    <div className="betaTag">
                        <p className="plainText">BETA</p>
                    </div> 
                </div> : 
                <div className="backNavigator" onClick={props.goBackToDashboard}>
                    <AiOutlineArrowLeft size={25} style={{ marginRight: 10 }} color='#2B1C50' />
                    <p className="plainText" style={{fontSize: '30px', color: '#2B1C50'}}>Dashboard</p>
                    <div className="betaTag">
                        <p className="plainText" style={{fontSize: '16px'}}>BETA</p>
                    </div>
                </div>
            }
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              {!isNaN(props.totalAllowedLength) && !isNaN(props.totalUsedLength) &&
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    margin: "0px 10px",
                  }}
                >
                  <BiTimeFive size={24} />
                  <h1
                    className="dashboardHeaderText"
                    style={{ fontSize: "24px", margin: "0px 10px", fontWeight: '700' }}
                  >
                    {Math.max(0, props.totalAllowedLength - props.totalUsedLength)} min
                  </h1>

                  {props.totalAllowedLength - props.totalUsedLength <= 5 && (
                    <button
                      className="fileUploadButton"
                      style={{ margin: "0px 10px" }}
                      onClick={() => props.setShowUpgradePlanAlert(true)}
                    >
                      <p className="plainText">Add more time</p>
                    </button>
                  )}
                </div>
              }

              <UserInfoDisplay
                showModal={props.showModal}
                setShowModal={props.setShowModal}
              />
            </div>
          </div>

          <div className="headerDivider"></div>
        </div>
    )
}

export default Header