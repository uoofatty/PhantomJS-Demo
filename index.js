var page = require('webpage').create();
var system = require('system'),
    t;
	
var address = 'http://www.idoeu.com';
	
var reqUrl;
// 如果命令行没有给出网址   指定URL
if (system.args.length == 1) {
    // .js 没有指定 url  手动指定
	console.log('please input house ID! Example："phantomjs index.js 360"');
    phantom.exit();
}else{
	// 获取 命令行url
	reqUrl = 'http://www.idoeu.com/view/housedetail.aspx?id=' + system.args[1];
}

console.log('URL : ' + reqUrl);

t = Date.now();	//开始时间

page.settings.webSecurityEnabled = 'false';

page.open(address, function (status) {

	if (status !== 'success') {
		console.log('FAIL to load the address');
	} else {
		console.log('URL success!');

		//保存图片
		//page.render('idoeu001.jpeg');
		//console.log('>>> 页面打开保存图片0011！');

		//登录页面
		page.evaluate(function(){
			$('#name').val('');
			$('#pwd').val('');
			$('#login').click();
		});

		//延迟3秒
		console.log('Login loading! 3s!');
		window.setTimeout(function ()
		{
			//page.render('idoeu002.jpeg');
			//console.log('>>> 表单赋值,并登录保存图片0022！');
			
			t = Date.now() - t; //计算加载时间
			console.log('Login success! Time ' + t + ' ms');
			
			//跳转页面
			page.evaluateJavaScript("function(){ location.href='"+ reqUrl +"' }");
			
			
			//延迟3秒
			console.log('Location.href loading! 3s!');

			window.setTimeout(function ()
			{
				//page.render('idoeu003.jpeg');
				//console.log('>>> 跳转至详情页，保存图片0033！');
				console.log('Location.href success!');
				
				//获取房产信息
				page.evaluate(function(){
				
					//获取房产国家
					var hcountry = $('.subNav').find('a').eq(1).text();
					
					//获取幻灯图片集合
					var hadImgArrs = [];
									
					$('.swiper-slide').each(function (idx, element) {
						var $element = $(element);
						var hai = $element.html().trim();
						
						hadImgArrs.unshift(hai);
						
					});
					
					//获取缩略图 - 取幻灯第一张图片
					var hthumbnails = $('.swiper-slide').find('img').eq(0).attr('src');
					
					// 获取标题
					var htitle = $('.content h1').text().trim();
					
					//获取城市.
					var hcity = "";
					
					if(htitle.indexOf('.') != -1){
						hcity = htitle.split('.')[0];
					}else if(htitle.indexOf('·') != -1){
						hcity = htitle.split('·')[0];
					}else if(htitle.indexOf('▪') != -1){
						hcity = htitle.split('▪')[0];
					}
					
					// 获取价格
					var hprice = ($('.free').text().trim().substr(1,$('.free').text().trim().length)/10000).toFixed(1);;
					
					// 获取货币类型
					var hpriceType = "";
					var pt = $('.free').text().trim().substr(0, 1);
					
					// 美元（$）   欧元（€）   加元（C$）   澳币（A$）
					switch(pt){
						case '$' : hpriceType = '美元'; break;
						case '€' : hpriceType = '欧元'; break;
						case 'C$' : hpriceType = '加元'; break;
						case 'A$' : hpriceType = '澳币'; break;
						default : hpriceType = '?'; break;
					}
					
					// 旗帜标识
					var hflag = $('.flag img').attr('src');
					
					var hid; // 房源编号：REF.ALI170614-03 
					var htype; //房屋类型：二手公寓 
					var haveragePrice; //房产均价：2037欧/平米 
					var hlayout; //户型：2室1卫 
					var harea; //房产面积：53平米 
					var hparking; //车位信息：不含车位 占地面积：
					
					//获取info下li信息
					var i = 0;
					$('.info li').each(function (idx, element) {
						var $element = $(element);
						var infos = $element.text();
						
						switch(i){
							case 0 : 
								//房源编号：REF.ALI170614-03 
								var hidNew;
								var hidOld = (infos.split('：')[1]);  
								if(hidOld.indexOf('.') != -1){
									hidNew = hidOld.split('.')[1];
								}else if(hidOld.indexOf('·') != -1){
									hidNew = hidOld.split('·')[1];
								}else if(hidOld.indexOf('▪') != -1){
									hidNew = hidOld.split('▪')[1];
								}else{
									hidNew = hidOld;
								}
								
								hid = 'GD.' + hidNew;
								/*
								if(hcountry.indexOf('西班牙') != -1 ){
									hid = 'SP.' + hidNew;
								}else if(hcountry.indexOf('葡萄牙') != -1){
									hid = 'PT.' + hidNew;
								}else if(hcountry.indexOf('意大利') != -1){
									hid = 'IT.' + hidNew;
								}else if(hcountry.indexOf('希腊') != -1){
									hid = 'GR.' + hidNew;
								}else{
									hid = 'GD.' + hidNew;
								}	
								*/
								break; 
							case 1 : htype = infos.split('：')[1];  break; //房屋类型：二手公寓
							case 2 : haveragePrice = infos.split('：')[1]; break; //房产均价：2037欧/平米 
							case 3 : hlayout = infos.split('：')[1]; break;//户型：2室1卫 
							case 4 : harea = infos.split('：')[1];  break;//房产面积：53平米 
							case 5 : hparking = infos.split('：')[1]; break; //车位信息：不含车位 占地面积：
							
							default :  break;
						}
						i++;
					});
					
					//房屋特色
					var hfeatures=''; //最后输出值
					var $hfeatures=""; 
					
					var j = 0;
					$('.trait span').each(function (idx, element) {
						var $element = $(element);
						var hf = $element.text();
						
						$hfeatures = $hfeatures + hf + ',';
						
						j++;
					});
					
					$hfeatures = ($hfeatures.substr(0,$hfeatures.length-1)).split(',');
					
					for(var hfs = 1; hfs < $hfeatures.length; hfs++){
						hfeatures = hfeatures + $hfeatures[hfs]+',';
					}
					
					var hinfo=''; //房源详情
					
					//房屋详情
					
					var k = 0;
					
					$('#house').find('p').each(function (idx, element) {
						
						var hi = $(this).text();
						
						hinfo += hi + " | ";
						
						k++;
					});
					
					//获取周边详情 hperipheryArrs 
					var hpimgArrs = [],
					hptitleArrs=[],
					hpenArrs=[],
					hpdescArrs=[];
					
					$('#periphery li').each(function (idx, element) {
						
						var $element = $(element);
						
						hpimgArrs.unshift($element.find('.pic img').attr('src'));
						hptitleArrs.unshift($element.find('h3').text());
						hpenArrs.unshift($element.find('.content').find('p').eq(0).text());
						hpdescArrs.unshift($element.find('.content').find('p').eq(1).text());

					});
					
					//获取交通及地理位置 location 图+文
					var hlocationImgArrs = []; 
					var hlocationTxt='';
					
					if($('#location img').length > 0){
						var hlParent = $('#location img').eq(0).parent().html().trim();
						hlocationImgArrs.unshift(hlParent);
					}
					
					//交通及地理位置 文
					
					if($('#location').find('p').length > 0){
						
						
						var n = 0;
					
						$('#location').find('p').each(function (idx, element) {
							
							var ha = $(this).text();
							
							hlocationTxt += ha;
							
							n++;
						});
						
					}
					
					//已售出信息，不入库！
					if( hpriceType != '?'){
					
						var dataString = 'hadimg=' + hadImgArrs + '&htitle=' + htitle + '&hprice=' + hprice + '&hpricetype=' + hpriceType + '&hflag=' + hflag + '&hid=' + hid + '&htype=' + htype + '&haverageprice=' + haveragePrice + '&hlayout=' + hlayout + '&harea=' + harea + '&hparking=' + hparking + '&hfeatures=' + hfeatures + '&hinfo=' + hinfo + '&hperipheryarrs=' + hpimgArrs+'|'+hptitleArrs+'|'+hpenArrs+'|'+ hpdescArrs + '&hlocationimg=' + hlocationImgArrs + '&hlocationtxt=' + hlocationTxt + '&hcountry=' + hcountry + '&hcity=' + hcity + '&hthumbnails=' + hthumbnails + '&action=post'+ '&diyid=28&do=2&dede_fields=hadimg,multitext;htitle,text;hprice,text;hpricetype,text;hflag,text;hid,text;htype,text;haverageprice,text;hlayout,text;harea,text;hparking,text;hfeatures,text;hinfo,multitext;hperipheryarrs,multitext;hlocationimg,multitext;hlocationtxt,text;hcountry,text;hcity,text;hthumbnails,text';
					
						console.log(dataString);
										
						$.ajax({
							type: "POST",
							url: "http://www.guodao.org/plus/diy.php", //提交到后台文件
							data: dataString, //传值
							success: function(data) {
								console.log("Mysql outPrint:" + data);
							}
						});
					}else{
						console.log("Mysql outPrint:no! caveat:已售出!");
					}
					
				});
				
				//输出显示
				console.log('=======SUCCESS=======');
				window.setTimeout(function ()
				{phantom.exit();}, 3000);
			}, 3000);

		}, 3000);

	}

});

page.onConsoleMessage = function(msg) {
    // system.stderr.writeLine('console: ' + msg);
    console.log('> ',msg);
};
