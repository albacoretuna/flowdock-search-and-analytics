import React from 'react'
import axios from 'axios'
export default class extends React.Component {
  static async getInitialProps ({ req }) {
    if(req) {
      // this will be run only on the server
    }
    const res = await axios.get('http://localhost:3000/api/status')
    return { status: res.data.status.lastUpdate}
  }
  render () {
    return <div>
      <div>Welcome to Flowdock Search and Analytics!</div>
      <p>Status: {this.props.status}</p>
    </div>
  }
}
