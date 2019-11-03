import * as React from "react";
import { fetchData } from "./../api";

export default class HackerNews extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      filter: "top",
      pageNumber: 1,
      items: []
    };
    this.updateFilter = this.updateFilter.bind(this);
    this.handleUpvote = this.handleUpvote.bind(this);
    this.loadMoreNews = this.loadMoreNews.bind(this);
    this.getApiData = this.getApiData.bind(this);
    this.gotoHomePage = this.gotoHomePage.bind(this);
    this.hideNews = this.hideNews.bind(this);
  }

  componentDidMount() {
    let query = "page=" + this.state.pageNumber;
    this.getApiData(query);

  }

  getApiData(query) {
    this.setState({
      isLoaded: false
    });

    fetchData(query).then(news => {
      news = this.updateDataWithLS(news);
      this.setState({
        isLoaded: true,
        items: news,
        pageNumber: this.state.pageNumber + 1
      });
    },
      error => {
        this.setState({
          isLoaded: true,
          error
        });
      })
  }

  getTimeDiff(createdAt) {
    let timestamp = new Date(createdAt).getTime();
    let currentTimestamp = new Date().getTime();

    let difference = currentTimestamp - timestamp;

    let daysDifference = Math.floor(difference / 1000 / 60 / 60 / 24);
    if (daysDifference && daysDifference > 0) {
      if (daysDifference >= 365) {
        return Math.floor(daysDifference / (30 * 12)) + " years ago";
      } else {
        if (daysDifference >= 30) {
          return Math.floor(daysDifference / 30) + " months ago";
        } else {
          return daysDifference + " days ago";
        }
      }
    }
    difference -= daysDifference * 1000 * 60 * 60 * 24;

    let hoursDifference = Math.floor(difference / 1000 / 60 / 60);
    if (hoursDifference && hoursDifference > 0) return hoursDifference + " hours ago";
    difference -= hoursDifference * 1000 * 60 * 60;

    let minutesDifference = Math.floor(difference / 1000 / 60);
    if (minutesDifference && minutesDifference > 0) return minutesDifference + " minutes ago";
    difference -= minutesDifference * 1000 * 60;

    let secondsDifference = Math.floor(difference / 1000);

    return secondsDifference + " seconds ago";
  }

  updateFilter(evt) {
    this.setState({
      filter: evt.target.id
    });
  }

  handleUpvote(evt) {
    evt.persist();
    let index = evt.target.dataset.idx;
    let items = [...this.state.items];
    items[index]["points"] = Number(items[index]["points"]) + 1
    this.setState({
      items: items
    });
    //set updated points in local storage
    localStorage.setItem(items[index]["objectID"] + "_points", items[index]["points"]);
  }

  hideNews(evt) {
    evt.persist();
    let index = evt.target.dataset.idx;
    let items = [...this.state.items];
    items[index]["hidden"] = true;
    this.setState({
      items: items
    }) 
    localStorage.setItem(items[index]["objectID"] + "_hidden", true);
  }

  loadMoreNews() {
    let query = "page=" + this.state.pageNumber;
    this.getApiData(query);
  }

  updateDataWithLS(data){
    return data.map( item => {
      let objID = item.objectID;
      if(localStorage.getItem(objID + "_points")){
        item["points"] = localStorage.getItem(item.objectID + "_points");
      }

      if(localStorage.getItem(objID + "_hidden")){
        item["hidden"] = true;
      }
      return item;
    })

  }

  gotoHomePage() {
    this.setState({
      pageNumber: 1
    }, () => {
      let query = "page=" + this.state.pageNumber;
      this.getApiData(query);
    })

  }

  render() {
    const { error, isLoaded, items } = this.state;
    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <div>Loading...</div>;
    } else {
      return (
        <div className="News-feeds">
          <div className="App-header">
            <div className="App-header-y" onClick={this.gotoHomePage}>Y</div>
            <div className="App-header-links">
              <span id="top" className={this.state.filter === "top" ? "active" : ""} onClick={this.updateFilter}>
                top
              </span>
              <span>|</span>
              <span id="new" className={this.state.filter === "new" ? "active" : ""} onClick={this.updateFilter}>
                new
              </span>
            </div>
          </div>
          <div className="App-content-area">
            {items.length &&
              items.map((news, index) => {
                const { title, url, author, points, num_comments, created_at, objectID } = news;             
                const publishedTime = this.getTimeDiff(created_at);
                if(news.hidden)console.log("hidden---", news.hidden, news);
                return (
                  <div style={{display: news.hidden ? "none": "flex"}} key={objectID} className="News">
                    <div className="Comments-count">{num_comments === null ? 0 : num_comments}</div>
                    <div className="Upvotes">
                      <div className="Upvotes-count">{points === null ? 0 : points}</div>
                      <div data-idx={index} className="Upvotes-action arrow-up" onClick={this.handleUpvote} />
                    </div>
                    <div className="News-content">
                      <span className="News-title">{title}</span>
                      <a href={url} className="News-domain">
                        (${url})
                      </a>
                      <span>by</span>
                      <a href="/">
                      <span className="News-username">{author}</span>
                      </a>                     
                      <span className="News-time">{publishedTime}</span>
                      <span data-idx={index} className="News-hide" onClick={this.hideNews}>
                        [ hide ]
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
          <div className="App-footer">
            {isLoaded && <span className="Load-more" onClick={this.loadMoreNews}>More</span>}
          </div>
        </div>
      );
    }
  }
}