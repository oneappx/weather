'use strict';
import { Component } from 'preact';
import AllCity from './city.js';
import AllIcon from './icon.js';
import './light.less';

class Weater extends Component {

constructor(props) {
    super(props);

    this.state = {
      page: 'localData',
      today: null,
      city: null,
      result: []
    }
    
    this.getLocalData();
  }

  getLocalData() {
    this.props.storage.get('', (data) => {
      if (!data) {
        this.setState({
          page: 'city'
        });
      } else if (data.city) {
        this.setState({
          city: data.city,
          page: 'weather'
        });
        this.getData(data.city.area.id);
      }
    });
  }

  getData(city) {
    this.getNextData(city);
    this.props.fetch(`https://api.seniverse.com/v3/weather/now.json?key=ej23jx5sitnc3sue&location=${city}`, 'get', null, (data) => {
      this.setState({
        page: 'weather',
        today: data && data.results && data.results[0] && data.results[0].now
      })
    });
    
  }
  getNextData(city) {
    this.props.fetch(`https://api.seniverse.com/v3/weather/daily.json?key=ej23jx5sitnc3sue&location=${city}`, 'get', null, (data) => {
      this.setState({
        result: data && data.results && data.results[0] && data.results[0].daily || []
      });
    });
  }

  changeCity(type, value, next) {
    let { city } = this.state;
    city = city || {};
    city[type] = value;
    this.state.city = city;
    this.setState({
      now: Date.now()
    });

    if (city.province && city.city && city.area && city.area.name && city.area.id) {
      this.props.storage.set('', {city}, () => {
        if (next == 'reload') {
          this.getData(city.area.id);
        }
      });
    }
  }
  
  renderCity() {
    let { city } = this.state;
    city = city || {};

    let province = AllCity[city.province];

    if (!province) {
      return <div class="selectCity">
        <div class="selectCityTitle">选择省份</div>
        <div class="selectCityList">
        {
          Object.keys(AllCity).map(province => {
            return <div class="selectCityItem" onClick={this.changeCity.bind(this, 'province', province)}>{ province }</div>;
          })
        }
        </div>
      </div>
    }

    let nowCity = province[city.city];
    if (!nowCity) {
      return <div class="selectCity">
        <div class="selectCityTitle">
          <span onClick={this.changeCity.bind(this, 'province', null)}>{city.province} </span>
          选择城市
        </div>
        <div class="selectCityList">
        {
          Object.keys(province).map(city => {
            return <div class="selectCityItem" onClick={this.changeCity.bind(this, 'city', city)}>{ city }</div>;
          })
        }
        </div>
      </div>
    }

    let area = nowCity[city.area];
    if (!area) {
      return <div class="selectCity">
        <div class="selectCityTitle">
          <span onClick={this.changeCity.bind(this, 'province', null)}>{city.province} </span> 
          <span onClick={this.changeCity.bind(this, 'city', null)}>{city.city} </span> 
          选择区县
        </div>
        <div class="selectCityList">
        {
          Object.keys(nowCity).map(id => {
            return <div class="selectCityItem" onClick={this.changeCity.bind(this, 'area', nowCity[id], 'reload')}>{ nowCity[id].name }</div>;
          })
        }
        </div>
      </div>
    }
  }

  selectCity() {
    this.setState({
      page: 'city'
    })
  }

  renderWeather() {
    let { today, result, city } = this.state;
    today = today || {};
    return <div class="weater">
      
      <div class="weaterDay">
        <div class="weaterTitle"><span onClick={this.selectCity.bind(this)}>{city.area.name}</span> 即时</div>
        <div class="weaterIcon" style={{background: `url(${ AllIcon[today.code] || AllIcon['99'] }) center/contain no-repeat`}}></div>
        {
          today.text ? <div class="weaterStatus">{ today.text }</div> : <div class="weaterStatus">暂无此地天气</div>
        }
        
        <div class="weaterStatus">{ today.temperature || 0 }°C</div>
      </div>
      {
        result[0] && <div class="weaterDay">
          <div class="weaterTitle">今日</div>
          <div class="weaterTitle">{result[0].low} ~ { result[0].high}°C</div>
          <div class="weaterTitle">{result[0].wind_direction}风 { result[0].wind_speed}</div>
          <div class="weaterTitle">白天{result[0].text_day}</div>
          <div class="weaterTitle">夜间{result[0].text_night}</div>
        </div>
      }
      {
        result[1] && <div class="weaterDay">
          <div class="weaterTitle">明日</div>
          <div class="weaterTitle">{result[1].low} ~ { result[1].high}°C</div>
          <div class="weaterTitle">{result[1].wind_direction}风 { result[1].wind_speed}</div>
          <div class="weaterTitle">白天{result[1].text_day}</div>
          <div class="weaterTitle">夜间{result[1].text_night}</div>
        </div>
      }
    </div>
  }

  render() {
    let { page } = this.state;
    return <div class="weaterComponent">
       {
         page == 'city' && this.renderCity()
       }
       {
         page == 'weather' && this.renderWeather()
       }
    </div>;
  }

}

module.exports = Weater;
