import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
// import React, { Component } from 'react';
// import FacebookLogin from 'react-facebook-login';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props'
import axios, { post } from 'axios';
import graph from 'fb-react-sdk';




class App extends Component {
  constructor(props) {
    super(props);


    this.state = {
      loginStatus: false,
      loginResponse: null,
      responseToken: null,
      page: 1,
      profile: {
        picture: null,
      },
      album: {
        id: null,
        images: null
      },
      slide: {
        clicked: null
      }
    }
    this.getPhotos = this.getPhotos.bind(this);
  }

  imageArray = [];


  // getPhotos(){
  //   console.log('im fine');
  //   axios.get(`https://graph.facebook.com/v3.2/${this.state.album.id}/photos?fields=images&access_token=${this.state.responseToken}`)
  //     .then((response) => {
  //       console.log('got images', response)
  //       this.setState({
  //         album:{
  //           // id:null,
  //           images: response.data.data
  //         }
  //       });
  //     })
  // }

  getPhotos() {
    console.log('im fine');
    axios.get(`https://graph.facebook.com/v3.2/${this.state.album.id}/photos?fields=images&access_token=${this.state.responseToken}`)
      .then((response) => {
        response.data.data.map(s => {
          this.imageArray.push(s.images[1].source)
        })
        this.setState({
          album: {
            images: this.imageArray
          }
        });
        console.log('got images', response)
        console.log('image array', this.imageArray);

      })
  }

  render() {

    const responseFacebook = (response) => {
      console.log(response);
      if (response.accessToken) {
        console.log('true;');
        this.setState({
          loginStatus: true,
          loginResponse: response,
          responseToken: response.accessToken,
        });

        graph.setAccessToken(response.accessToken);





        graph.get(`264935813565644/picture?fields=picture`, function (err, res) {
          console.log(res, 'test thumbnail'); // { picture: 'http://profile.ak.fbcdn.net/'... }
        }.bind(this));


        graph.get(`${response.userID}?fields=picture.width(200).height(200)`, function (err, res) {
          console.log(res); // { picture: 'http://profile.ak.fbcdn.net/'... }
          this.setState({
            profile: {
              picture: res.picture.data.url
            }
          });
        }.bind(this));
      }
      console.log(this.state.loginResponse, 'state');
      // console.log('got user picture',response)





    }



    return (
      <div className="App">
      <div className='header'>
      {this.state.loginStatus && this.state.page == 1 && <label className='logout' onClick={()=>{ 
              this.setState({
                loginStatus: false
              });
            }}>Logout</label>}
          {this.state.loginStatus &&
            <div style={{textAlign: 'left',paddingLeft: '32px'}}>
            <label className='name'>{this.state.loginResponse.name}</label>
            <div>
              {this.state.profile.picture && <img style={{height: '66px', cursor: 'pointer'}} src={this.state.profile.picture} />}
            </div>
            </div>
        }
      </div>

        {this.state.loginStatus == false &&
          <div>
            <h1>LOGIN WITH FACEBOOK AND GOOGLE</h1>
            <FacebookLogin
              appId="404243016818262"
              autoLoad
              callback={responseFacebook}
              fields="name,email,picture,albums"
              // scope="public_profile,user_friends,user_actions.books"
              render={renderProps => (
                <button className='test' onClick={renderProps.onClick}>Click To login With Facebook</button>
              )}
            />
          </div>}
        {this.state.loginStatus && this.state.page == 1 &&
          <div>

            {/* <img src='https://graph.facebook.com/v3.2/264935813565644/picture/type=thumbnail?access_token=EAADrM78VfJQBABI2CHGwfd0CpxdVRdXhaLxseZCEUIHqe0yVZC27EbEA88r4kdREBLcJunYZBHVymRwsXEZBZCU64DGnhfgDrgK2lg2zp9rp5nSjEBjjJ7ceXBXCRqczljtSZAeWnKIBJI2j2wMsyJaKBfE3fR4UXMJkBKveppLhg7au8vJYHg8oBXMFooVGQZD'/> */}
         
            <div>
              {
                this.state.loginResponse.albums.data.map(p => {
                  var source = `https://graph.facebook.com/v3.2/${p.id}/picture/type=thumbnail?access_token=${this.state.responseToken}`
                  return <img onClick={() => {
                    this.setState({
                      page: 2,
                      album: {
                        id: p.id
                      }
                    });
                  }} className='thumbnails' src={source} style={{ height: '200px', width: '200px', cursor: "pointer" }} />

                })

              }
            </div>
          </div>

        }

        {(this.state.page == 3 ||
          this.state.page == 2) &&
          <div>
            <label style={{ cursor: 'pointer' }} onClick={() => {
              this.setState({
                page: 1,
                album: {
                  id: null,
                  images: null
                }
              });
              this.imageArray = [];
            }}>
              GO BACK TO LIST OF ALBUMS
          </label>
            <div>
              {this.state.album.id && this.getPhotos()}
              {this.state.album.images != null && <div>
                {
                  this.state.album.images.map(p => {
                    // return p.images[5].source
                    return <img className='thumbnails' src={p} style={{ height: '200px', width: '200px',cursor: "pointer" }}
                      onClick={() => {
                        console.log(this.state.album.images.indexOf(p));
                        this.setState({
                          page: 3,
                          slide: {
                            clicked: this.state.album.images.indexOf(p)
                          }
                        });
                      }} />


                  })
                }
              </div>}

            </div>

          </div>
        }
        {
          this.state.page == 3 &&
          <div>
            <div id="overlay"></div>
            <div className='slide'>
              <a id="picture" href="#" onKeyDown={(e) => {
                console.log(e.keyCode, 'keydown');
                if (e.keyCode == '37') {
                  if (this.state.slide.clicked == 0) {
                    this.setState({
                      slide: {
                        clicked: this.imageArray.length - 1,
                      }
                    });
                  }
                  else {
                    this.setState({
                      slide: {
                        clicked: this.state.slide.clicked - 1,
                      }
                    });
                  }
                }
                if (e.keyCode == '39') {
                  if (this.imageArray.length == this.state.slide.clicked + 1) {
                    this.setState({
                      slide: {
                        clicked: 0,
                      }
                    });
                  }
                  else {
                    this.setState({
                      slide: {
                        clicked: this.state.slide.clicked + 1,
                      }
                    });
                  }
                }
                if (e.keyCode == '27') {
                  this.setState({
                    page: 2,
                    slide: {
                      clicked: null
                    }
                  });
                }
              }}>
                <img className='slideimg' src={this.state.album.images[this.state.slide.clicked]} />
              </a>
              <div className='slidecntrl'>
                <label className="slidebtn left" onClick={() => {
                  if (this.state.slide.clicked == 0) {
                    this.setState({
                      slide: {
                        clicked: this.imageArray.length - 1,
                      }
                    });
                  }
                  else {
                    this.setState({
                      slide: {
                        clicked: this.state.slide.clicked - 1,
                      }
                    });
                  }
                }}>Prev</label>
                <label className="slidebtn" onClick={() => {
                  this.setState({
                    page: 2,
                    slide: {
                      clicked: null
                    }
                  });
                }}>Close(X)</label>
                <label className="slidebtn right" onClick={() => {
                  if (this.imageArray.length == this.state.slide.clicked + 1) {
                    this.setState({
                      slide: {
                        clicked: 0,
                      }
                    });
                  }
                  else {
                    this.setState({
                      slide: {
                        clicked: this.state.slide.clicked + 1,
                      }
                    });
                  }
                }}>Next</label>

              </div>
            </div>
            {/* {this.state.slide.clicked} */}
          </div>
        }


      </div>
    );
  }
}

export default App;
