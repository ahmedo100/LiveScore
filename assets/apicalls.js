var apiKey = "";
//league name map 
var leagueNamesMap = new Map();
leagueNamesMap.set(2021,"Premiere league : Angleterre");
leagueNamesMap.set(2015,"Ligue 1 : France");
leagueNamesMap.set(2019,"Serie A : Italie");
leagueNamesMap.set(2014,"La liga : Espagne");
//get which type of competition 
var competitionId = window.location.href.split("id=")[1];
//set the current league name 
document.getElementById("leagueName").innerHTML = leagueNamesMap.get(parseInt(competitionId));

// request object 
var xhttp = new XMLHttpRequest();
//open request channel of type GET
xhttp.open("GET", "https://api.football-data.org/v2/competitions/"+competitionId+"/standings");
// request token for API
xhttp.setRequestHeader("X-Auth-Token",apiKey)
//response handler
xhttp.onreadystatechange = function(){
    if (this.readyState == 4 && this.status==200){
        var parsedJson = JSON.parse(this.responseText);
        var standings = parsedJson.standings[0].table;
        var tbody = document.getElementById("tbody");
        var stringHtml = "";
        for(var i = 0 ; i<standings.length ; i++){
            stringHtml +="<tr>";
            var currElem = standings[i];

            // formulate html 
            stringHtml +="<th> "+ currElem.position + "</th>";
            stringHtml +="<td><a id='"+currElem.team.id+"' class='test'>"+ currElem.team.name +"&nbsp;</a><img width='20' height='15' src='"+currElem.team.crestUrl+"'/>&nbsp;</td>";
            stringHtml +="<td>"+ currElem.points + "</td>";
            stringHtml +="<td>" + currElem.playedGames +"</td>";
            stringHtml +="<td>" +currElem.won +"</td>";
            stringHtml +="<td>" + currElem.draw +"</td>";
            stringHtml +="<td>" + currElem.lost + "</td>";
            stringHtml +="<td>" + currElem.goalsFor  +"</td>";
            stringHtml +="<td>" + currElem.goalsAgainst +"</td>";
            var diff = currElem.goalsFor - currElem.goalsAgainst;
            stringHtml +="<td>" + diff + "</td>";
            stringHtml +="</tr>";
        }

        tbody.innerHTML = stringHtml;
        var modalDlg = document.querySelector('#image-modal');
        var imageModalCloseBtn = document.querySelector('#image-modal-close');
        var btn = document.querySelector('.test');

        var btn = document.querySelectorAll('.test');

        btn.forEach((e)=>{
            e.addEventListener('click', function(evt){
                modalDlg.classList.add('is-active');
                createModalFromDataCallBack(e.id);
              });
        });

        
        imageModalCloseBtn.addEventListener('click', function(){
          modalDlg.classList.remove('is-active');
        });
        
    }
};

    //get Today's date and format other dates
    let d=new Date(new Date().getTime() + (7 * 24 * 60 * 60 * 1000)); // add 7 days to current date
    var dateTo = "dateTo="+formatDate(d);
    var dateFrom ="dateFrom="+formatDate(new Date());
    // get match history 
    var matchHistoryXHTTP = new XMLHttpRequest();
    //create request with token api
    matchHistoryXHTTP.open("GET","https://api.football-data.org/v2/matches?competitions="+competitionId+"&"+dateTo+"&"+dateFrom);
    matchHistoryXHTTP.setRequestHeader("X-Auth-Token",apiKey);
    matchHistoryXHTTP.onreadystatechange = function(){
        //send request
        if(this.status == 200 && this.readyState ==4){
           var parsedJson = (JSON.parse(this.responseText)).matches;
           //get 
           var stringArray = parsedJson.map((e)=>{
                    var currString = "<tr>";
                    currString += "<td><h5 class='title is-5'>"+e.homeTeam.name+"</h5></td>";
                    currString +="<td>"+(e.score.winner != null ? e.score.fullTime.homeTeam + ":"+ e.score.fullTime.awayTeam : "--:--")+ "</td>";
                    currString +="<td><h5 class='title is-5'>"+e.awayTeam.name+"</h5></td>"
                    currString +="</tr>";
                    return currString;
            });

            let stringHtml =  stringArray.reduce((str,e)=>{
                        return str+e;
            });

            document.getElementById("scoreId").innerHTML = stringHtml;
        }
    }
    matchHistoryXHTTP.send();

// send request
xhttp.send();

function createModalFromDataCallBack(teamId){
    var teamPlayersRequestHandler = new XMLHttpRequest();
    teamPlayersRequestHandler.open("GET", "https://api.football-data.org/v2/teams/"+teamId);
    teamPlayersRequestHandler.setRequestHeader("X-Auth-Token",apiKey);
    teamPlayersRequestHandler.setRequestHeader("Accept","application/json");
    teamPlayersRequestHandler.onreadystatechange = function(){
         if(this.status==200 && this.readyState == 4){
            var teamInfo = JSON.parse(this.responseText);
            // set team values 
            document.getElementById("modalTitle").innerHTML= teamInfo.name;
            document.getElementById("nomEquipe").innerHTML= "Nom: "+teamInfo.name ;
            document.getElementById("dateCreationEquipe").innerHTML ="Date de création: "+teamInfo.founded ;
            document.getElementById("stadeEquipe").innerHTML = "Stade: "+teamInfo.venue;
            document.getElementById("imgLogo").src = teamInfo.crestUrl;
            // set players values
            var stringHtml = "";
            for(let i = 0 ; i<teamInfo.squad.length ; i++){
                stringHtml += "<tr>";
                var currPlayer = teamInfo.squad[i];
                var dob = new Date(currPlayer.dateOfBirth);
                stringHtml +="<td>"+ currPlayer.name +"</td>";
                stringHtml +="<td>"+ dob.getFullYear()+"/"+dob.getMonth()+"/"+dob.getDay()+"</td>";
                stringHtml +="<td>" + currPlayer.nationality +"</td>"
                stringHtml +="<td>" + (currPlayer.shirtNumber != null ? currPlayer.shirtNumber : "") + "</td>";
                stringHtml +="<td>" + (currPlayer.position != null ? currPlayer.position : "COACH") + "</td>";
                stringHtml +="</tr>";
            }
            document.getElementById("bodyNomJoueurs").innerHTML =  stringHtml;

        }  
    }
    teamPlayersRequestHandler.send();
    

}

function swapView(){
    if(!document.getElementById("classement").classList.contains("is-active")){
            document.getElementById("classement").classList.add("is-active");
            document.getElementById("matches").classList.remove("is-active");
            document.getElementById("historyColumns").classList.remove("hide");
            document.getElementById("matchHistory").classList.add("hide");

    }else if(!document.getElementById("matches").classList.contains("is-active")){
        document.getElementById("matches").classList.add("is-active");
        document.getElementById("classement").classList.remove("is-active");
        document.getElementById("matchHistory").classList.remove("hide");
        document.getElementById("historyColumns").classList.add("hide");
    }
}


function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}
