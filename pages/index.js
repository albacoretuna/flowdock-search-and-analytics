import React from 'react'
import axios from 'axios'
export default class extends React.Component {
  static async getInitialProps ({ req }) {
    const res = await axios.get('http://localhost:3000/api/status')
    return { status: res.data.status}
  }
  render () {
    return <div>
      <div>Welcome to Flowdock Search and Analytics!</div>
      <p>Status: {this.props.status}</p>
    </div>
  }
}
