console.log("HARRISON: Hello world!");

// store url on load
let currentPage = location.href;
let cw;

async function pageChange(newURL) {
    const match = newURL.match(/https?:\/\/(www\.)disneyplus\.com\/video\/(?<id>.*)/);

    if(match) {
        const comments = new Comments(match.groups.id);
        await comments.fetchComments();

        cw.showSidebarToggle(true);
        cw.setComments(comments);
    } else {
        cw.showSidebarToggle(false);
        cw.closeReplyWindow();
    }
}

// listen for changes
setInterval(function()
{
    if (currentPage != location.href)
    {
        // page has changed, set new page as 'current'
        currentPage = location.href;
        
        // do your thing..
        pageChange(currentPage);
    }
}, 500);


window.addEventListener("load", async () => {
    cw = new CommentWindow()
    pageChange(currentPage);
});