import React, { Component } from 'react';
import TitleBar from '../views/TitleBar';
import ListItem from '../views/ListItem';
import ListItemDivider from '../views/ListItemDivider';
import SideBar from '../views/SideBar';
import CommonLoadingView from '../views/CommonLoadingView';
import global from '../utils/global';
import utils from '../utils/utils';
import data from '../utils/data';
import NIM from 'react-native-netease-im';
import pinyinUtil from '../utils/pinyinutil';

import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  Button,
  PixelRatio,
  FlatList,
  TouchableHighlight,
  ToastAndroid
} from 'react-native';

var { width, height } = Dimensions.get('window');

export default class ContactsScreen extends Component {
  static navigationOptions = {
    tabBarLabel: '联系人',
    tabBarIcon: ({ focused, tintColor }) => {
      if (focused) {
        return (
          <Image style={styles.tabBarIcon} source={require('../../images/ic_contacts_selected.png')}/>
        );
      }
      return (
        <Image style={styles.tabBarIcon} source={require('../../images/ic_contacts_normal.png')}/>
      );
    },
  };
  constructor(props) {
    super(props);
    this.state = {
      loadingState: global.loading,
      contactData: null,
    }
  }
  getContacts() {
    // var url = "http://rnwechat.applinzi.com/contacts/30"; // 老接口
    var url = "http://rnwechat.applinzi.com/friends"; // 新接口
    fetch(url).then((res)=>res.json())
      .then((json)=>{
        this.setState({
          loadingState: global.loadSuccess,
          contactData: json
        })
      })
  }
  render() {
    switch (this.state.loadingState) {
      case global.loading:
        this.getContacts();
        return this.renderLoadingView();
      case global.loadSuccess:
        return this.renderSuccessView();
      case global.loadError:
        return this.renderErrorView();
      default:
    }
  }
  renderLoadingView() {
    return (
      <View style={styles.container}>
        <TitleBar nav={this.props.navigation}/>
        <View style={styles.content}>
          <CommonLoadingView hintText={"正在获取联系人数据..."}/>
        </View>
      </View>
    );
  }
  renderErrorView() {
    return (
      <View style={{justifyContent: 'center', alignItems: 'center', flex: 1, flexDirection: 'column'}}>
        <Text style={{fontSize: 16, color: '#000000'}}>加载数据出错！</Text>
      </View>
    );
  }
  renderSuccessView() {
    var listData = [];
    var headerListData = [];
    var headerImages = [require('../../images/ic_new_friends.png'), require('../../images/ic_group_chat.png'),
                        require('../../images/ic_tag.png'), require('../../images/ic_common.png')];
    var headerTitles = ['新的朋友', '群聊', '标签', '公众号'];
    var index = 0;
    for (var i = 0; i < headerTitles.length; i++) {
      headerListData.push({
        key: index++,
        title: headerTitles[i],
        nick: '',
        icon: headerImages[i],
        sectionStart: false,
      });
    }
    var contacts = this.state.contactData;
    for (var i = 0; i < contacts.length; i++) {
      // var pinyin = pinyinUtil.getFullChars(contacts[i].name);
      var pinyin = contacts[i].pinyin.toUpperCase();
      var firstLetter = pinyin.substring(0, 1);
      if (firstLetter < 'A' || firstLetter > 'Z') {
        firstLetter = '#';
      }
      let icon = require('../../images/avatar.png');
      if (!utils.isEmpty(contacts[i].avatar)) {
        icon = {uri: contacts[i].avatar};
      }
      listData.push({
        key: index++,
        icon: icon,
        title: contacts[i].name,
        nick: contacts[i].nick,
        pinyin: pinyin,
        firstLetter: firstLetter,
        sectionStart: false,
      })
    }
    // 按拼音排序
    listData.sort(function(a, b) {
      if (a.pinyin === undefined || b.pinyin === undefined) {
        return 1;
      }
      if(a.pinyin > b.pinyin) {
        return 1;
      }
      if (a.pinyin < b.pinyin) {
        return -1;
      }
      return 0;
    });
    listData = headerListData.concat(listData);
    // 根据首字母分区
    for (var i = 0; i < listData.length; i++) {
      var obj = listData[i];
      if (obj.pinyin === undefined) {
        continue;
      }
      if (i > 0 && i < listData.length) {
        var preObj = listData[i - 1];
        if (preObj.pinyin === undefined && obj.pinyin !== undefined) {
          obj.sectionStart = true;
        } else if (preObj.pinyin !== undefined && obj.pinyin !== undefined && preObj.firstLetter !== obj.firstLetter) {
          obj.sectionStart = true;
        }
      }
    }
    return (
      <View style={styles.container}>
        <TitleBar nav={this.props.navigation}/>
        <View style={styles.divider}></View>
        <View style={styles.content}>
          <FlatList
            data={listData}
            renderItem={this.renderItem}
          />
          <SideBar />
        </View>
        <View style={styles.divider}></View>
      </View>
    );
  }
  onListItemClick(item) {
    let index = item.item.key;
    if (index == 0) {
      // 新的朋友
      this.props.navigation.navigate('NewFriend', {title: '新的朋友', data: item.item})
    } else if (index >= 1 && index <= 3) {
      ToastAndroid.show('功能未实现', ToastAndroid.SHORT);
    } else {
      this.props.navigation.navigate('ContactDetail', {title: '详细资料', data: item.item});
    }
  }
  renderItem = (item) => {
    var section = [];
    if (item.item.sectionStart) {
      section.push(<Text key={"section" + item.item.key} style={listItemStyle.sectionView}>{item.item.firstLetter}</Text>);
    }
    return (
      <View>
        {section}
        <TouchableHighlight underlayColor={global.touchableHighlightColor} onPress={()=>{this.onListItemClick(item)}}>
          <View style={listItemStyle.container} key={item.item.key}>
              <Image style={listItemStyle.image} source={item.item.icon} />
              <Text style={listItemStyle.itemText}>{item.item.title}</Text>
              <Text style={listItemStyle.subText}>{utils.isEmpty(item.item.nick) ? "" : "(" + item.item.nick + ")"}</Text>
          </View>
        </TouchableHighlight>
        <View style={{width: width, height: 1 / PixelRatio.get(), backgroundColor: global.dividerColor}}/>
      </View>
    );
  }
}

const listItemStyle = StyleSheet.create({
  container: {
    width: width,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF'
  },
  image: {
    marginLeft: 15,
    marginRight: 15,
    marginTop: 8,
    marginBottom: 8,
    width: 35,
    height: 35,
  },
  itemText: {
    fontSize: 15,
    color: '#000000'
  },
  subText: {
    fontSize: 15,
    color: '#999999'
  },
  sectionView: {
    width: width,
    backgroundColor: 'rgba(0, 0, 0, 0)',
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 2,
    paddingBottom: 2,
    color: '#999999'
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  divider: {
    width: width,
    height: 1 / PixelRatio.get(),
    backgroundColor: '#D3D3D3'
  },
  content: {
    flex: 1,
    width: width,
    flexDirection: 'row',
    backgroundColor: global.pageBackgroundColor
  },
  tabBarIcon: {
    width: 24,
    height: 24,
  },
});
