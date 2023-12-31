const SubscriptionTable = (props) => {
    return (
        <div className="subscriptionContainer">
            {/* production */}
            <stripe-pricing-table 
                pricing-table-id="prctbl_1NkJQnEBAB8jl0TlqJbCDxfa"
                publishable-key="pk_live_51Nk9qQEBAB8jl0TlNOaRQHrohGYlNsQSRoPEpypVEk6mG7X56ChfAMxVTMv9YvDtktiegWHI1hI6xwWT2ORpT4M600vWy8LTk2"
                client-reference-id={props.userId}
            >
            </stripe-pricing-table>
            
            {/* test */}
            {/* <stripe-pricing-table 
                pricing-table-id="prctbl_1NkAJiEBAB8jl0Tl9NdIgeu9"
                publishable-key="pk_test_51Nk9qQEBAB8jl0Tlp0jY2h4VpBcKHffJoOTzTe14nizb0GqcStJKoLnwRb7jKNYrb7VZHJRWZ0lThCvRaD4CnlGD0021OPoaVX"
                client-reference-id={props.userId}
            >
            </stripe-pricing-table> */}

            <a 
                className="plainText"

                // test
                // href="https://billing.stripe.com/p/login/test_dR61877Kz6it9fa288"

                // production
                href="https://billing.stripe.com/p/login/5kA5o30jqgDx7Mk9AA"

                target="_blank" 
                rel="noopener noreferrer"
                style={{color: '#2b1c50', textDecoration: 'underline'}}
            >
                Manage my subscription
            </a>
        </div>
    )
}

export default SubscriptionTable