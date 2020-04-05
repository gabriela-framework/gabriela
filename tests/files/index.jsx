import React, {Component} from "react";

export default class DefaultLayout extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <html lang="en">
        <head>
            <meta charSet="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />

            <title>Title</title>
        </head>

        <body>
            <div className="col-xs-12 col-md-12 col-lg-12">
            </div>

            <div id="globalModal" />
        </body>

        </html>
    }
}
