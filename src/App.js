import React, { Component } from 'react';
import Particles from 'react-particles-js';
import Navigation from './components/navigation/navigation';
import SignIN from './components/SignIN/SignIN';
import Register from './components/Register/Register';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Logo from './components/logo/logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import Errorboundry from './components/Errorboundry';
import './App.css';

const particleOptions = {
  particles: {
    number: {
      value: 100,
      density: {
        enable: true,
        value_area: 800
      }
    },
    move: {
      enable: true,
    }
  }
};

const initialState = {
    input: '',
    imageUrl: '',
    box: {},
    route: 'signin',
    isSignedIn: false,
    user: {
      id: '',
      name: '',
      email: '',
      entries: 0,
      joined: ''
    }
  }


class App extends Component {
  constructor() {
    super();
    this.state = initialState;
  }

/*   componentDidMount() {
    fetch('http://localhost:3000')
    .then(response => response.json())
    .then(console.log)
  } */

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }

  FaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height),
    }
    //console.log(width, height);
  }

  displayFaceBox = (box) => {
    console.log(box);
    this.setState({ box: box });
  }
  
  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input})
      fetch('http://localhost:3000/imageurl', {
            method: 'post',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({
                input: this.state.input
              })
            })
            .then(response => response.json())
    .then(response => {
      if (response) {
        fetch('http://localhost:3000/image', {
          method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
            .then(response => response.json())
            .then(count => {
              this.setState(Object.assign(this.state.user, { entries: count}))
        }).catch(console.log('error'))
      }
      this.displayFaceBox(this.FaceLocation(response))
    })
        //console.log(response.outputs[0].data.regions[0].region_info.bounding_box);
    .catch(err => console.log(err));
  }
  
  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState(initialState)
    } else if (route === 'home') {
      this.setState({isSignedIn: true})
    }
    this.setState({route: route});
  }
  
  render() {
    const { isSignedIn, imageUrl, route, box } = this.state; //destructuring (clean up a bit :)
    return (
      <div className="App">
        <Particles className='particles' params={particleOptions} />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
          {this.state.route === 'home'
           ?<div>   {/* otherwise return the logo component... */}
              <Logo />  
              <Rank 
              name={this.state.user.name}
              entries={this.state.user.entries}
              />
              <ImageLinkForm 
              onInputChange={this.onInputChange} 
              onButtonSubmit={this.onButtonSubmit}
              />
              <Errorboundry>
                <FaceRecognition box={box} imageUrl={imageUrl} />
              </Errorboundry>
            </div>
            : (
              route === 'signin'
              ? <SignIN loadUser={this.loadUser} onRouteChange={this.onRouteChange} /> //if thats true return signin component
              : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} /> //else return register component
            )
           
          }
      </div>
    );
  }
}

export default App;
