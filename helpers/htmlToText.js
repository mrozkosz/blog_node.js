module.exports = async (html, len = 0) => {
    let text = "" + html;

    //-- remove BR tags and replace them with line break
    text = text.replace(/\n/gi, "");
    text = text.replace(/\r/gi, "");
    text = text.replace(/<br>/gi, "");
    text = text.replace(/<br\s\/>/gi, "");
    text = text.replace(/<br\/>/gi, "");

    //-- remove all inside SCRIPT and STYLE tags
    text = text.replace(/<script.*>[\w\W]{1,}(.*?)[\w\W]{1,}<\/script>/gi, "");
    text = text.replace(/<style.*>[\w\W]{1,}(.*?)[\w\W]{1,}<\/style>/gi, "");
    //-- remove all else
    text = text.replace( /(<([^>]+)>)/ig, '');
    text = text.replace(/\s+/g, ' ').trim();

    if(len === 0){
        return text;
    }

    const trimmedString = text.substring(0, len);
    return trimmedString.substring(0, Math.min(trimmedString.length, trimmedString.lastIndexOf(" "))) + "..."


}