// Normalize a word
TFIDF_normalize = function normalize(word) {
    // return word.replace(/[^\w]/g, "");
    return word;
};

// Tokenize a doc
TFIDF_tokenize = function tokenize(doc) {
    if (doc)
        return doc.split(/[\s_():.!?,;]+/);
    
    return [];
};

TFIDF_reduce = function(previous, current, index, array) {
    if(!(current in previous)) {
        previous[current] = 1 / array.length;
    } else {
        previous[current] += 1 / array.length;
    }
    return previous;
};

// Text frequency
TFIDF_tf = function tf(words, stopWords) {
    return words
        // Normalize words
        .map(TFIDF_normalize)
        // Filter out stop words and short words
        .filter(function(word) {
            return word.length > 1 && (!stopWords || !~stopWords.indexOf(word));
        })
        // Reduce
        .reduce(TFIDF_reduce, {});
};

// Inverse document frequency
TFIDF_idf = function idf(D, dted) {
    return Math.log(D / (1 + dted)) / Math.log(10);
};

// Main entry point, load the corpus and return an object
// which can calculate the tfidf for a certain doc
TFIDF_analyze = function analyze(corpus, _stopWords) {
    var
        // Total number of (unique) documents
        D = 0,
        // Number of documents containing the term
        dted = {},
        // Keep our calculated text frequencies
        docs = {},
        // Normalized stop words
        stopWords;
    
    if(_stopWords) stopWords = _stopWords.map(TFIDF_normalize);

    // Key the corpus on their md5 hash
    function hash(doc) {
        var hash = 0, i, chr, len;
        if (doc.length == 0) 
            return hash;

        for (var i = 0, len = doc.length; i < len; i++) {
            chr   = doc.charCodeAt(i);
            hash  = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }

        return hash;
    }

    function add(h, doc) {
        // One more document
        D++;
        // Calculate and store the term frequency
        docs[h] = TFIDF_tf(TFIDF_tokenize(doc), stopWords);
        // Update number of documents with term
        for(term in docs[h]) {
            if(!(term in dted)) dted[term] = 0;
            dted[term]++;
        }
    }

    if(!(corpus instanceof Array)) {
        // They are loading a previously analyzed corpus
        var data = corpus instanceof Object ? corpus : JSON.parse(corpus);
        D = data.D;
        dted = data.dted;
        docs = data.docs;
    } else {
        // They are loading a term and a corpus
        for(var i = 0, l = corpus.length; i < l; i++) {
            var doc = corpus[i],
                h = hash(doc);

            // Add the document if it's new to us
            if(!(h in docs)) {
                add(h, doc);
            }
        }
    }

    // Return a function which calculates the tfidf for this document
    return {
        tfidf: function(t, doc) {
            var h = hash(doc),
                term = TFIDF_normalize(t);

            // If it's a new document, add it
            if(!(h in docs)) {
                add(h, doc);
            }
            
            // Return the tfidf
            if(term in docs[h])
                return docs[h][term] * TFIDF_idf(D, dted[term]);
            else
                return 0;
        },
        asJSON: function() {
            return JSON.stringify({
                version: 1,
                D: D,
                dted: dted,
                docs: docs
            });
        }
    };
};