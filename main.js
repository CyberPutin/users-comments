let comments = [];

const likeComments = (wrp, img, commentId) => {
    if (wrp.classList.contains('like-tap')) {
        wrp.classList.remove('like-tap');
        img.src = '././sources/svg/heart.svg';
        comments.filter(el => {
            return el.commentId == commentId;
        })[0].liked = false;
    } else {
        wrp.classList.add('like-tap');
        img.src = '././sources/svg/like.svg';
        comments.filter(el => {
            return el.commentId == commentId;
        })[0].liked = true;
    }
    localStorage.setItem('comment', JSON.stringify(comments));
}

const deleteComment = (commentId, event) => {
    const commentsWrp = document.querySelector('.comments');
    const currentComment = event.target.closest('.comment-content');
    commentsWrp.removeChild(currentComment);
    comments = comments.filter(el => {
        return el.commentId != commentId;
    })
    localStorage.setItem('comment', JSON.stringify(comments));
}

const addZero = (num) => {
    if (num <= 9) {
        return '0' + num;
    }
    return num;
}

const createElement = (wrp, nameTag, classTitle, txtTag, extraObj) => {
    const tag = document.createElement(nameTag);
    tag.className = classTitle;
    tag.innerHTML = txtTag;
    if (extraObj && extraObj.src) {
        tag.src = extraObj.src
    }
    wrp.append(tag);
    return tag;
}

const createComment = (comment) => {
    let formDate = valedateDate(comment.commentDate);
    const commentContent = document.querySelector('.comments');
    const wrpTag = document.createElement('div');
    wrpTag.classList.add('comment-content');

    createElement(wrpTag, 'p', 'comment-content_username', comment.userName, null);
    createElement(wrpTag, 'p', 'comment-content_opinion', comment.commentTxt, null);
    createElement(wrpTag, 'p', 'comment-content_datetime', formDate, null);

    let commentLike;
    let commentLikePic;
    if (comment.liked) {
        commentLike = createElement(wrpTag, 'div', 'comment-like like-tap', null, null);
        commentLikePic = createElement(commentLike, 'img', 'comment-like_pic', null, { src: '././sources/svg/like.svg' });
    } else {
        commentLike = createElement(wrpTag, 'div', 'comment-like', null, null);
        commentLikePic = createElement(commentLike, 'img', 'comment-like_pic', null, { src: '././sources/svg/heart.svg' });
    }

    commentLike.onclick = () => likeComments(commentLike, commentLikePic, comment.commentId)
    const commentTrash = createElement(wrpTag, 'div', 'comment-delete', null, null);
    createElement(commentTrash, 'img', 'comment-delete_pic', null, { src: './sources/svg/icon-trash.svg' });
    commentTrash.onclick = (event) => deleteComment(comment.commentId, event);

    commentContent.prepend(wrpTag)
}

const valedateUserName = (userName) => {
    return /^[a-zA-ZА-Яа-я ]+$/.test(userName);
}

const valedateCommentTxt = (commentTxt, maxLength) => {
    if (commentTxt.length > maxLength) {
        return false
    }
    return true
}

const formatDate = (dateUTC) => {
    const dateNow = new Date()
    const difDate = Math.floor((dateNow - dateUTC) / (60 * 60 * 24 * 1000));
    const formTime = `${addZero(dateNow.getHours())}:${addZero(dateNow.getMinutes())}`
    
    if (difDate == 0) {
        return `сегодня, ${formTime}`
    } else if (difDate == 1) {
        return `вчера, ${formTime}`
    } else {
        return `${dateUTC.toLocaleDateString()}, ${formTime}`
    }
}

const valedateDate = (commentDate) => {
    const dateUTC = new Date(commentDate);
    if (commentDate) {
        return formatDate(dateUTC)
    } else {
        return `сегодня, ${addZero(new Date().getHours())}:${addZero(new Date().getMinutes())}`
    }
}

const saveComments = (comments) => {
    localStorage.setItem('comment', JSON.stringify(comments));
}

const addComment = (event) => {
    event.preventDefault();
    const userName = document.querySelector('#username');
    const commentDate = document.querySelector('#date');
    const commentTxt = document.querySelector('.user-activ__form_content_text');
    const maxLengthComments = 700;

    const resultUserName = valedateUserName(userName.value);
    const resultTxt = valedateCommentTxt(commentTxt.value, maxLengthComments);

    if (!resultUserName || !resultTxt || !userName.value || !commentTxt.value) {
        if (!resultUserName || !userName.value) {
            const commentsNameError = document.querySelector('.user-activ__form_data_name_err');
            const commentsNameErrorBody = document.querySelector('.user-activ__form_data_name_err_txt');
            const commentsNameInputError = document.querySelector('.user-activ__form_data_name__input');

            commentsNameError.classList.add('user-activ__form_data_name_err_visible');
            commentsNameInputError.classList.add('user-activ__form_data_name__input_err');
            
            if (!userName.value) {
                commentsNameErrorBody.innerHTML = 'Заполните это поле';
            } else if (!resultUserName) {
                commentsNameErrorBody.innerHTML = 'Недопустимое имя пользователя';
            }
        }
        if (!resultTxt || !commentTxt.value) {
            const commentsBlockTxt = document.querySelector('.user-activ__form_content_text');
            const commentsBlockError = document.querySelector('.user-activ__form_content_err');
            const commentsBlockErrorBody = document.querySelector('.user-activ__form_content_err_txt');

            commentsBlockError.classList.add('user-activ__form_content_err_visible');
            commentsBlockTxt.classList.add('user-activ__form_content_text_err');

            if (!commentTxt.value) {
                commentsBlockErrorBody.innerHTML = 'Заполните это поле';
            } else if (!resultTxt) {
                commentsBlockErrorBody.innerHTML = `Допустимая длина ${maxLengthComments} символов`;
            }
        }
        throw 'Ошибка';
    }

    const id = comments && comments.length > 0 ? +comments[comments.length - 1].commentId + 1 : 1

    const comment = {
        userName: userName.value,
        commentDate: commentDate.value,
        commentTxt: commentTxt.value,
        liked: false,
        commentId: id
    }

    comments.push(comment);

    userName.value = '';
    commentDate.value = '';
    commentTxt.value = '';

    saveComments(comments);
    createComment(comment);
}

document.querySelector('.user-activ__form').onsubmit = addComment;

const init = () => {
    const localStorageComments = JSON.parse(localStorage.getItem('comment'));
    if (localStorageComments) {
        comments = localStorageComments;
        if (comments && comments.length != 0) {
            for (comment of comments) {
                createComment(comment)
            }
        }
    }
}

document.querySelector('#username').onkeydown = (event) => {
    if (!event.key.match(/[A-Za-zА-Яа-я ]/)) {
        event.preventDefault();
    }
}

const removeError = (input, blockError, contains, txtError) => {
    const inputElem = document.querySelector(input);
    const blockWithError = document.querySelector(blockError);
    if (blockWithError.classList.contains(contains)) {
        blockWithError.classList.remove(contains);
        inputElem.classList.remove(txtError);
    }
}

document.querySelector('.user-activ__form_content_text').oninput = () => {
    removeError('.user-activ__form_content_text', '.user-activ__form_content_err',
        'user-activ__form_content_err_visible', 'user-activ__form_content_text_err');
}

document.querySelector('.user-activ__form_data_name__input').oninput = () => {
    removeError('.user-activ__form_data_name__input', '.user-activ__form_data_name_err',
    'user-activ__form_data_name_err_visible', 'user-activ__form_data_name__input_err');
}

init()
